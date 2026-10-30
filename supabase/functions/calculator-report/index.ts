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
import { emailKey } from "../_shared/lib/email-key.ts";
import { buildReportEmail } from "./email.ts";

const DUPLICATE_WINDOW_MINUTES = 10;
const HOURLY_SUBMISSION_CAP = 100;
const IP_HOURLY_CAP = 5;
const SENDING_LOCK_SECONDS = 60;

// Keyed hash of the caller's IP, for the per-IP limit only. The service role key is the HMAC key:
// it never leaves the server, so the hashes cannot be reversed by enumerating IPv4 addresses.
const hashIp = async (request: Request): Promise<string | null> => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
  if (!ip) return null;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip)));
  return Array.from(mac.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

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

  // One atomic call: dedupe window, hourly volume cap (the endpoint is public, so total volume is
  // bounded) and insert/reuse. See claim_calculator_submission in the calculator_hardening migration.
  const { data: claim, error: claimError } = await supabase
    .rpc("claim_calculator_submission", {
      p_email: email,
      p_email_key: emailKey(email),
      p_ip_hash: await hashIp(request),
      p_language: language,
      p_inputs: inputs,
      p_result: computeResult(inputs),
      p_window_minutes: DUPLICATE_WINDOW_MINUTES,
      p_hourly_cap: HOURLY_SUBMISSION_CAP,
      p_ip_hourly_cap: IP_HOURLY_CAP,
      p_sending_seconds: SENDING_LOCK_SECONDS,
    })
    .single<{
      status: "ok" | "rate_limited" | "in_progress" | "ip_limited" | "busy";
      submission_id: string | null;
    }>();
  if (claimError || !claim) {
    console.error("claim failed:", claimError?.message);
    return reply({ error: "server_error" }, 500);
  }
  // rate_limited: a report was really sent in the window (the modal shows 429 as "already sent").
  if (claim.status === "rate_limited") return reply({ error: "rate_limited" }, 429);
  // Not 429: the other request's email may still fail, so the visitor must not be told it was sent.
  if (claim.status === "in_progress") return reply({ error: "in_progress" }, 409);
  if (claim.status === "ip_limited") return reply({ error: "ip_limited" }, 503);
  if (claim.status === "busy") return reply({ error: "busy" }, 503);
  // An unsent row from an earlier attempt is reused by the claim, so a retry never duplicates a lead.
  const row = { id: claim.submission_id! };

  // The claim marked the row as "sending" so a concurrent request waits. On a failed send, release
  // it so the visitor's retry is not blocked for the rest of the lock window.
  const failed = async () => {
    const { error } = await supabase.from("calculator_submissions").update({ sending_at: null }).eq("id", row.id);
    if (error) console.error("could not release sending lock for", row.id, error.message);
    return reply({ error: "email_failed" }, 502);
  };

  // From here the row is the lead and is kept. If the email can't go out the visitor gets an error
  // (report_sent_at stays null), and submitting again retries the send.
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or REPORT_FROM is not set; report not sent for", row.id);
    return failed();
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
      return failed();
    }
  } catch (error) {
    console.error("Resend request failed for", row.id, error);
    return failed();
  }

  const { error: sentError } = await supabase
    .from("calculator_submissions")
    .update({ report_sent_at: new Date().toISOString() })
    .eq("id", row.id);
  if (sentError) console.error("could not mark report as sent for", row.id, sentError.message);

  return reply({ ok: true });
});
