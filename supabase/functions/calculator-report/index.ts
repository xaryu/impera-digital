// Receives a calculator submission, stores it, and emails the breakdown report (Resend) after the
// address owner confirmed it (double opt-in).
//
//   1. POST {email, language, inputs, consent, website}: stores the lead and sends a short
//      confirmation email with a one-time link. No report content goes out yet.
//   2. POST {action: "confirm", token}: the link's page calls this when the visitor presses its
//      button (a POST, so link scanners that only GET the page cannot trigger it). Sends the report.
//
// The browser sends only the visitor's inputs and email, never any email text, and the result is
// recomputed here, so this function cannot be used to mail arbitrary content and what we store
// is never a number the browser claimed.
//
// Secrets (supabase secrets set ...): RESEND_API_KEY (sending-only key), REPORT_FROM
// (e.g. "Impera <report@mail.impera.digital>"), SITE_URL (allowed CORS origins, comma-separated).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
//
// Shared code lives in ../_shared (npm run sync:function-shared), never edit it there.
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { computeResult, inputsSchema } from "../_shared/lib/calculator.ts";
import { emailKey } from "../_shared/lib/email-key.ts";
import { buildConfirmationEmail, buildReportEmail } from "./email.ts";

const DUPLICATE_WINDOW_MINUTES = 10;
const HOURLY_SUBMISSION_CAP = 100;
const IP_HOURLY_CAP = 5;
const SENDING_LOCK_SECONDS = 60;
const CONFIRM_LINK_HOURS = 24;

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

// 32 random bytes, base64url without padding, see newToken.
const confirmSchema = z.object({
  action: z.literal("confirm"),
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const sha256 = async (text: string) => toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))));

// Only the hash of the token is stored, so a database read does not give anyone a working link.
const newToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// English has no URL prefix, FR/NL do (see the routing note in CLAUDE.md).
const confirmUrl = (origin: string, language: "en" | "fr" | "nl", token: string) =>
  `${origin}${language === "en" ? "" : `/${language}`}/calculator/confirm?token=${token}`;

// Resend send. Returns false (and logs) on any failure; the caller decides what the visitor sees.
const sendEmail = async (
  message: { to: string; subject: string; html: string },
  idempotencyKey: string,
  logId: string,
) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or REPORT_FROM is not set; email not sent for", logId);
    return false;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html }),
    });
    if (!response.ok) {
      console.error("Resend rejected the email for", logId, response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend request failed for", logId, error);
    return false;
  }
};

// SITE_URL may hold several origins, comma-separated (production, custom domain, www, Vercel
// previews). Localhost is not allowed by default: add it to SITE_URL while developing against the
// deployed function, and take it out again.
const allowedOrigins = () =>
  (Deno.env.get("SITE_URL") ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

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

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  const confirmation = confirmSchema.safeParse(body);
  if (confirmation.success) return confirmReport(confirmation.data.token);

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return reply({ error: "invalid_request" }, 400);
  const { email, language, inputs, website } = parsed.data;

  // Bots fill the hidden field. Pretend it worked so they learn nothing.
  if (website) {
    console.warn("honeypot filled, submission dropped");
    return reply({ ok: true });
  }

  // The confirmation link points at the site the visitor submitted from, so it must be one of ours.
  const origin = request.headers.get("Origin");
  const linkOrigin = origin && allowedOrigins().includes(origin) ? origin : allowedOrigins()[0];
  if (!linkOrigin) {
    console.error("SITE_URL is not set; cannot build the confirmation link");
    return reply({ error: "server_error" }, 500);
  }

  // One atomic call: dedupe window, hourly volume cap (the endpoint is public, so total volume is
  // bounded) and insert/reuse. See claim_calculator_submission in the calculator_double_optin migration.
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
  // rate_limited: a confirmation email really went out in the window (the modal shows 429 as "already sent").
  if (claim.status === "rate_limited") return reply({ error: "rate_limited" }, 429);
  // Not 429: the other request's email may still fail, so the visitor must not be told it was sent.
  if (claim.status === "in_progress") return reply({ error: "in_progress" }, 409);
  if (claim.status === "ip_limited") return reply({ error: "ip_limited" }, 503);
  if (claim.status === "busy") return reply({ error: "busy" }, 503);
  // An unsent row from an earlier attempt is reused by the claim, so a retry never duplicates a lead.
  const row = { id: claim.submission_id! };

  // The claim marked the row as "sending" so a concurrent request waits. On a failed send, release
  // it so the visitor's retry is not blocked for the rest of the lock window.
  const releaseLock = async () => {
    const { error } = await supabase.from("calculator_submissions").update({ sending_at: null }).eq("id", row.id);
    if (error) console.error("could not release sending lock for", row.id, error.message);
  };
  const failed = async () => {
    await releaseLock();
    return reply({ error: "email_failed" }, 502);
  };

  // A fresh token on every attempt: the one in an earlier, undelivered email is simply replaced.
  const token = newToken();
  const tokenHash = await sha256(token);
  const { error: tokenError } = await supabase
    .from("calculator_submissions")
    .update({
      confirm_token_hash: tokenHash,
      confirm_expires_at: new Date(Date.now() + CONFIRM_LINK_HOURS * 3600 * 1000).toISOString(),
    })
    .eq("id", row.id);
  if (tokenError) {
    console.error("could not store the confirmation token for", row.id, tokenError.message);
    return failed();
  }

  // From here the row is the lead and is kept. If the email can't go out the visitor gets an error
  // (confirmation_sent_at stays null), and submitting again retries the send.
  const { subject, html } = buildConfirmationEmail(language, confirmUrl(linkOrigin, language, token));
  // The key includes the token: Resend rejects a reused key with a different payload.
  if (!(await sendEmail({ to: email, subject, html }, `calculator-confirm/${row.id}/${tokenHash.slice(0, 16)}`, row.id))) {
    return failed();
  }

  const { error: sentError } = await supabase
    .from("calculator_submissions")
    .update({ confirmation_sent_at: new Date().toISOString(), sending_at: null })
    .eq("id", row.id);
  if (sentError) console.error("could not mark confirmation as sent for", row.id, sentError.message);

  return reply({ ok: true });

  // Second step: the visitor opened the link and pressed the button.
  async function confirmReport(rawToken: string) {
    const { data: claimed, error: confirmError } = await supabase
      .rpc("confirm_calculator_submission", {
        p_token_hash: await sha256(rawToken),
        p_sending_seconds: SENDING_LOCK_SECONDS,
      })
      .single<{
        status: "ok" | "sent" | "invalid" | "expired" | "in_progress";
        submission_id: string | null;
        email: string | null;
        language: "en" | "fr" | "nl" | null;
        inputs: unknown;
      }>();
    if (confirmError || !claimed) {
      console.error("confirm failed:", confirmError?.message);
      return reply({ error: "server_error" }, 500);
    }
    if (claimed.status === "sent") return reply({ ok: true, already_sent: true });
    if (claimed.status === "invalid") return reply({ error: "invalid_token" }, 404);
    if (claimed.status === "expired") return reply({ error: "expired" }, 410);
    if (claimed.status === "in_progress") return reply({ error: "in_progress" }, 409);

    const id = claimed.submission_id!;
    // Re-validate what the database returns instead of trusting the cast, then build from it.
    const stored = inputsSchema.safeParse(claimed.inputs);
    const storedLanguage = z.enum(["en", "fr", "nl"]).safeParse(claimed.language);
    const release = async () => {
      const { error } = await supabase.from("calculator_submissions").update({ sending_at: null }).eq("id", id);
      if (error) console.error("could not release sending lock for", id, error.message);
    };
    if (!stored.success || !storedLanguage.success || !claimed.email) {
      console.error("stored submission is not valid, report not sent for", id);
      await release();
      return reply({ error: "server_error" }, 500);
    }

    const report = buildReportEmail(stored.data, storedLanguage.data);
    // The inputs are fixed at confirmation time, so one key per submission is enough.
    if (!(await sendEmail({ to: claimed.email, ...report }, `calculator-report/${id}`, id))) {
      await release();
      return reply({ error: "email_failed" }, 502);
    }

    const { error: reportError } = await supabase
      .from("calculator_submissions")
      .update({ report_sent_at: new Date().toISOString(), sending_at: null })
      .eq("id", id);
    if (reportError) console.error("could not mark report as sent for", id, reportError.message);
    return reply({ ok: true });
  }
});
