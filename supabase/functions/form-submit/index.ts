// The site's public forms: contact page, exit-intent popup (leads) and job applications.
// POST {kind: "contact" | "lead" | "application", ..., website}
//
// The browser cannot insert into these tables itself (RLS, see the public_forms_via_function
// migration). This function drops honeypot hits, applies a per-IP hourly limit, stores the row with
// the service role and emails the owner at site_settings.notification_email (set in /admin,
// Settings tab; falls back to company.email). If that email fails the submission is still kept and
// the visitor still sees success: the row is the record, the email is only the alert.
//
// CVs: the browser uploads the file to cv-uploads/<job id>/<uuid>.<ext> first (anon storage policy),
// then sends the path here. The notification links to the file with a 7-day signed URL.
//
// Secrets: RESEND_API_KEY, REPORT_FROM, SITE_URL (allowed CORS origins), same as calculator-report.
// Shared code lives in ../_shared (npm run sync:function-shared), never edit it there.
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { company } from "../_shared/config/company.ts";
import { services } from "../_shared/config/services.ts";
import { buildNotificationEmail, type Field } from "./email.ts";

const IP_HOURLY_CAP = 5;
const CV_LINK_SECONDS = 7 * 24 * 3600;

// Keyed hash of the caller's IP, same scheme as calculator-report (see the X-Forwarded-For note in
// CLAUDE.md: still to be tested whether the gateway trusts a client-supplied first entry).
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

const email = z.string().trim().toLowerCase().email().max(255);
const honeypot = z.string().max(500).optional(); // real visitors never fill it
const serviceIds = services.map((service) => service.id) as [string, ...string[]];

const requestSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("contact"),
    name: z.string().trim().min(1).max(100),
    email,
    company: z.string().trim().max(100).optional().default(""),
    service: z.union([z.enum(serviceIds), z.literal("multiple"), z.literal("")]).optional().default(""),
    message: z.string().trim().min(1).max(5000),
    website: honeypot,
  }),
  z.object({
    kind: z.literal("lead"),
    email,
    source: z.enum(["exit_intent"]),
    website: honeypot,
  }),
  z.object({
    kind: z.literal("application"),
    jobId: z.string().uuid(),
    fullName: z.string().trim().min(1).max(100),
    email,
    motivation: z.string().trim().min(1).max(5000),
    cvPath: z.string().max(200).nullable(),
    website: honeypot,
  }),
]);

type Kind = z.infer<typeof requestSchema>["kind"];
const tables: Record<Kind, "contact_submissions" | "leads" | "job_applications"> = {
  contact: "contact_submissions",
  lead: "leads",
  application: "job_applications",
};

// What CareerPost.tsx uploads: <job id>/<random uuid>.<pdf|doc|docx>, nothing else.
const cvPathPattern = (jobId: string) =>
  new RegExp(`^${jobId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(pdf|doc|docx)$`);

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

const sendEmail = async (
  message: { to: string; replyTo: string; subject: string; html: string; text: string },
  idempotencyKey: string,
) => {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM");
  if (!apiKey || !from) {
    console.error("RESEND_API_KEY or REPORT_FROM is not set; notification not sent for", idempotencyKey);
    return;
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        reply_to: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!response.ok) {
      console.error("Resend rejected the notification", idempotencyKey, response.status, await response.text());
    }
  } catch (error) {
    console.error("Resend request failed for", idempotencyKey, error);
  }
};

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
  const form = parsed.data;

  // Bots fill the hidden field. Pretend it worked so they learn nothing.
  if (form.website) {
    console.warn("honeypot filled, submission dropped:", form.kind);
    return reply({ ok: true });
  }

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const table = tables[form.kind];

  const ipHash = await hashIp(request);
  if (ipHash) {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(Date.now() - 3600 * 1000).toISOString());
    if (error) {
      console.error("ip count failed:", error.message);
      return reply({ error: "server_error" }, 500);
    }
    if ((count ?? 0) >= IP_HOURLY_CAP) return reply({ error: "ip_limited" }, 429);
  }

  // Build the row and the notification for each form.
  let row: Record<string, unknown>;
  let title: string;
  let fields: Field[];
  let link: { label: string; url: string } | undefined;
  let removeCv: (() => Promise<void>) | undefined;

  if (form.kind === "contact") {
    row = { name: form.name, email: form.email, company: form.company, service: form.service, message: form.message };
    title = `New contact message from ${form.name}`;
    fields = [
      { label: "Name", value: form.name },
      { label: "Email", value: form.email },
      { label: "Company", value: form.company },
      { label: "Service", value: form.service },
      { label: "Message", value: form.message },
    ];
  } else if (form.kind === "lead") {
    row = { email: form.email, source: form.source };
    title = `New lead: ${form.email}`;
    fields = [
      { label: "Email", value: form.email },
      { label: "Source", value: form.source },
    ];
  } else {
    const { data: job, error: jobError } = await supabase
      .from("job_openings")
      .select("id, title, published")
      .eq("id", form.jobId)
      .maybeSingle();
    if (jobError) {
      console.error("job lookup failed:", jobError.message);
      return reply({ error: "server_error" }, 500);
    }
    if (!job || !job.published) return reply({ error: "job_not_found" }, 404);

    if (form.cvPath !== null) {
      const cvPath = form.cvPath;
      if (!cvPathPattern(job.id).test(cvPath)) return reply({ error: "invalid_request" }, 400);
      // Fails when no such file was uploaded, so this also checks that the CV exists.
      const { data: signed, error: signError } = await supabase.storage
        .from("cv-uploads")
        .createSignedUrl(cvPath, CV_LINK_SECONDS);
      if (signError || !signed) return reply({ error: "cv_missing" }, 400);
      link = { label: "Download the CV (link valid 7 days)", url: signed.signedUrl };
      removeCv = async () => {
        const { error } = await supabase.storage.from("cv-uploads").remove([cvPath]);
        if (error) console.error("could not remove orphan CV", cvPath, error.message);
      };
    }
    row = {
      job_opening_id: job.id,
      full_name: form.fullName,
      email: form.email,
      motivation_letter: form.motivation,
      cv_url: form.cvPath,
    };
    title = `New application for ${job.title} from ${form.fullName}`;
    fields = [
      { label: "Position", value: job.title },
      { label: "Name", value: form.fullName },
      { label: "Email", value: form.email },
      { label: "Motivation", value: form.motivation },
      { label: "CV", value: form.cvPath ? null : "No CV attached" },
    ];
  }

  const { data: inserted, error: insertError } = await supabase
    .from(table)
    .insert({ ...row, ip_hash: ipHash })
    .select("id")
    .single();
  if (insertError || !inserted) {
    await removeCv?.();
    // P0001: the hourly cap trigger (public_forms_hardening migration).
    if (insertError?.code === "P0001") return reply({ error: "busy" }, 503);
    console.error("insert failed:", form.kind, insertError?.message);
    return reply({ error: "server_error" }, 500);
  }

  const { data: settings, error: settingsError } = await supabase
    .from("site_settings")
    .select("notification_email")
    .maybeSingle();
  if (settingsError) console.error("could not read site_settings:", settingsError.message);
  const to = settings?.notification_email || company.email;

  await sendEmail(
    { to, replyTo: form.email, ...buildNotificationEmail(title, fields, link) },
    `form-submit/${table}/${inserted.id}`,
  );

  return reply({ ok: true });
});
