// Receives a calculator submission, stores it, and emails the breakdown report (Resend).
//
// The browser sends only the visitor's inputs and email, never any email text, and the result is
// recomputed here, so this function cannot be used to mail arbitrary content and what we store
// is never a number the browser claimed.
//
// Secrets (supabase secrets set ...): RESEND_API_KEY (sending-only key), REPORT_FROM
// (e.g. "Impera <report@mail.impera-group.com>"), SITE_URL (allowed CORS origins, comma-separated).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Shared code lives in ../_shared (npm run sync:function-shared), never edit it there.
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { computeResult, inputsSchema } from "../_shared/lib/calculator.ts";
import { buildReportEmail } from "./email.ts";

const DUPLICATE_WINDOW_MINUTES = 10;
const HOURLY_SUBMISSION_CAP = 100;

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  language: z.enum(["en", "fr", "nl"]),
  inputs: inputsSchema,
  consent: z.literal(true),
  website: z.string().optional(), // honeypot: real visitors never fill it
});

// SITE_URL may hold several origins, comma-separated (custom domain, www, ...).
const allowedOrigins = () => [
  ...(Deno.env.get("SITE_URL") ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  "http://localhost:8080",
  "http://localhost:5173",
];

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins().includes(origin) ? origin : "null",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});

Deno.serve(async (request) => {
  const headers = corsHeaders(request.headers.get("Origin"));
  const reply = (body: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply({ error: "method_not_allowed" }, 405);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "invalid_json" }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return reply({ error: "invalid_request" }, 400);
  const { email, language, inputs, website } = parsed.data;

  // Bots fill the hidden field. Pretend it worked so they learn nothing.
  if (website) {
    console.warn("honeypot filled, submission dropped");
    return reply({ ok: true });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60_000).toISOString();
  const { data: recent, error: lookupError } = await supabase
    .from("calculator_submissions")
    .select("id, language, inputs, report_sent_at")
    .eq("email", email)
    .gte("created_at", since)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (lookupError) {
    console.error("duplicate check failed:", lookupError.message);
    return reply({ error: "server_error" }, 500);
  }
  // Only a report that was really sent counts as a duplicate (the modal shows 429 as "already sent").
  if (recent.some((r) => r.report_sent_at)) return reply({ error: "rate_limited" }, 429);

  // An earlier attempt stored the lead but the email never went out: reuse that row, with what the
  // visitor submitted now (they may have changed the numbers or the language since).
  let row: { id: string };
  const unsent = recent[0];
  if (unsent) {
    row = unsent;
    const { error: updateError } = await supabase
      .from("calculator_submissions")
      .update({ language, inputs, result: computeResult(inputs) })
      .eq("id", row.id);
    if (updateError) {
      console.error("update of unsent submission failed:", updateError.message);
      return reply({ error: "server_error" }, 500);
    }
  } else {
    // The endpoint is public, so cap total volume to bound abuse (spam to other people's addresses).
    const hourAgo = new Date(Date.now() - 60 * 60_000).toISOString();
    const { count: hourly, error: capError } = await supabase
      .from("calculator_submissions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hourAgo);
    if (capError) {
      console.error("volume check failed:", capError.message);
      return reply({ error: "server_error" }, 500);
    }
    if ((hourly ?? 0) >= HOURLY_SUBMISSION_CAP) return reply({ error: "busy" }, 503);

    const now = new Date().toISOString();
    const { data: inserted, error: insertError } = await supabase
      .from("calculator_submissions")
      .insert({ email, language, inputs, result: computeResult(inputs), consent_at: now })
      .select("id, created_at")
      .single();
    if (insertError) {
      console.error("insert failed:", insertError.message);
      return reply({ error: "server_error" }, 500);
    }
    row = inserted;

    // The check above and this insert are not atomic. If a concurrent request for the same email
    // stored a row first, keep only the oldest one so a single report goes out.
    const { data: winners, error: raceError } = await supabase
      .from("calculator_submissions")
      .select("id")
      .eq("email", email)
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .limit(1);
    if (raceError) {
      console.error("race check failed:", raceError.message);
    } else if (winners[0] && winners[0].id !== row.id) {
      const { error: deleteError } = await supabase.from("calculator_submissions").delete().eq("id", row.id);
      if (deleteError) console.error("could not remove duplicate row", row.id, deleteError.message);
      // Not 429: the other request's email may still fail, so the visitor must not be told it was sent.
      return reply({ error: "in_progress" }, 409);
    }
  }

  // From here the row is the lead and is kept. If the email can't go out the visitor gets an error
  // (report_sent_at stays null), and submitting again retries the send.
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or REPORT_FROM is not set; report not sent for", row.id);
    return reply({ error: "email_failed" }, 502);
  }

  const { subject, html } = buildReportEmail(inputs, language);
  // The key covers the content too: Resend rejects a reused key with a different payload, which
  // would otherwise block a retry after the visitor changed their numbers.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({ inputs, language })));
  const contentHash = Array.from(new Uint8Array(digest).slice(0, 8), (byte) => byte.toString(16).padStart(2, "0")).join("");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `calculator-report/${row.id}/${contentHash}`,
      },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });
    if (!response.ok) {
      console.error("Resend rejected the report for", row.id, response.status, await response.text());
      return reply({ error: "email_failed" }, 502);
    }
  } catch (error) {
    console.error("Resend request failed for", row.id, error);
    return reply({ error: "email_failed" }, 502);
  }

  const { error: sentError } = await supabase
    .from("calculator_submissions")
    .update({ report_sent_at: new Date().toISOString() })
    .eq("id", row.id);
  if (sentError) console.error("could not mark report as sent for", row.id, sentError.message);

  return reply({ ok: true });
});
