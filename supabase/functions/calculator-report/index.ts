// Receives a calculator submission, stores it, and emails the breakdown report (Resend).
//
// The browser sends only the visitor's inputs and email, never any email text, and the result is
// recomputed here, so this function cannot be used to mail arbitrary content and what we store
// is never a number the browser claimed.
//
// Secrets (supabase secrets set ...): RESEND_API_KEY (sending-only key), REPORT_FROM
// (e.g. "Impera <report@mail.impera-group.com>"), SITE_URL (allowed CORS origin).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Shared code lives in ../_shared (npm run sync:function-shared), never edit it there.
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { computeResult, inputsSchema } from "../_shared/lib/calculator.ts";
import { buildReportEmail } from "./email.ts";

const DUPLICATE_WINDOW_MINUTES = 10;

const requestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  language: z.enum(["en", "fr", "nl"]),
  inputs: inputsSchema,
  consent: z.literal(true),
  website: z.string().optional(), // honeypot: real visitors never fill it
});

const allowedOrigins = () =>
  [Deno.env.get("SITE_URL"), "http://localhost:8080", "http://localhost:5173"].filter(Boolean) as string[];

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
  if (website) return reply({ ok: true });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const since = new Date(Date.now() - DUPLICATE_WINDOW_MINUTES * 60_000).toISOString();
  const { count, error: lookupError } = await supabase
    .from("calculator_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if (lookupError) {
    console.error("duplicate check failed:", lookupError.message);
    return reply({ error: "server_error" }, 500);
  }
  if (count) return reply({ error: "rate_limited" }, 429);

  const now = new Date().toISOString();
  const { data: row, error: insertError } = await supabase
    .from("calculator_submissions")
    .insert({ email, language, inputs, result: computeResult(inputs), consent_at: now })
    .select("id")
    .single();
  if (insertError) {
    console.error("insert failed:", insertError.message);
    return reply({ error: "server_error" }, 500);
  }

  // From here the row is the lead: a failed email is logged and can be retried, but the visitor
  // still gets ok (report_sent_at stays null).
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or REPORT_FROM is not set; report not sent for", row.id);
    return reply({ ok: true });
  }

  const { subject, html } = buildReportEmail(inputs, language);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `calculator-report/${row.id}`,
      },
      body: JSON.stringify({ from, to: [email], subject, html }),
    });
    if (response.ok) {
      await supabase.from("calculator_submissions").update({ report_sent_at: new Date().toISOString() }).eq("id", row.id);
    } else {
      console.error("Resend rejected the report for", row.id, response.status, await response.text());
    }
  } catch (error) {
    console.error("Resend request failed for", row.id, error);
  }

  return reply({ ok: true });
});
