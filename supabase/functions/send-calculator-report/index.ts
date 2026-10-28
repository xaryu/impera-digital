// Receives a calculator submission, stores it, and emails the breakdown report.
//
// Two deliberate choices:
//  * the browser sends only numbers and task ids — never any email text — so
//    this function cannot be used to mail arbitrary content to arbitrary people;
//  * the result is recomputed here from the inputs, so what we store and send is
//    never whatever the browser claimed the answer was.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY       sending key; without it the submission is still stored
//   REPORT_FROM_EMAIL    e.g. "Impera <reports@impera-group.com>"
//   REPORT_NOTIFY_EMAIL  internal address that gets a copy of each lead
//   CALENDLY_URL         booking link used by the report's CTA
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";
import { LIMITS, TASKS, calculate, type Inputs } from "./model.ts";
import { buildReport, resolveLanguage } from "./report.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TASK_IDS = new Set(TASKS.map((task) => task.id));

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const whole = (value: unknown, { min, max }: { min: number; max: number }): number | null => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return rounded < min || rounded > max ? null : rounded;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 255 || !EMAIL_PATTERN.test(email)) {
    return json({ error: "Invalid email" }, 400);
  }

  // The report is only ever sent to someone who ticked the consent box.
  if (body.consent !== true) return json({ error: "Consent required" }, 400);

  const raw = (body.inputs ?? {}) as Record<string, unknown>;
  const people = whole(raw.people, LIMITS.people);
  const hoursPerPersonPerWeek = whole(raw.hoursPerPersonPerWeek, LIMITS.hoursPerPersonPerWeek);
  const hourlyCost = whole(raw.hourlyCost, LIMITS.hourlyCost);
  if (people === null || hoursPerPersonPerWeek === null || hourlyCost === null) {
    return json({ error: "Invalid inputs" }, 400);
  }

  const tasks = Array.isArray(raw.tasks)
    ? [...new Set(raw.tasks.filter((task): task is string => typeof task === "string" && TASK_IDS.has(task)))]
    : [];

  const inputs: Inputs = { people, hoursPerPersonPerWeek, hourlyCost, tasks };
  const result = calculate(inputs);
  const language = resolveLanguage(body.language);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { data: submission, error: insertError } = await supabase
    .from("calculator_submissions")
    .insert({
      email,
      consent: true,
      language,
      people,
      hours_per_person_per_week: hoursPerPersonPerWeek,
      hourly_cost: hourlyCost,
      tasks,
      hours_per_week: result.hoursPerWeek,
      hours_per_year: result.hoursPerYear,
      yearly_cost: result.yearlyCost,
      automatable_hours_low: result.automatable.hoursLow,
      automatable_hours_high: result.automatable.hoursHigh,
      automatable_cost_low: result.automatable.costLow,
      automatable_cost_high: result.automatable.costHigh,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("calculator_submissions insert failed:", insertError.message);
    return json({ error: "Could not store submission" }, 500);
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REPORT_FROM_EMAIL") ?? "Impera <onboarding@resend.dev>";
  const notify = Deno.env.get("REPORT_NOTIFY_EMAIL");
  const calendlyUrl = Deno.env.get("CALENDLY_URL") ?? "https://calendly.com/flavianconstantinovici48/30min";

  if (!apiKey) {
    // The lead is safe in the database; only the email is missing.
    console.warn("RESEND_API_KEY is not set — submission stored, report not sent.");
    return json({ ok: true, reportSent: false });
  }

  const { subject, html } = buildReport({ language, inputs, result, calendlyUrl });

  const send = (payload: Record<string, unknown>) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  let reportSent = false;
  try {
    const response = await send({ from, to: [email], subject, html, reply_to: notify ?? undefined });
    reportSent = response.ok;
    if (!response.ok) console.error("Resend rejected the report:", await response.text());
  } catch (error) {
    console.error("Resend request failed:", error);
  }

  if (reportSent) {
    await supabase.from("calculator_submissions").update({ report_sent: true }).eq("id", submission.id);
  }

  // Internal heads-up. Best-effort: a failure here must not affect the visitor.
  if (notify) {
    try {
      await send({
        from,
        to: [notify],
        subject: `Calculator lead: ${email} — ${result.hoursPerYear} h/year`,
        html: `<p><strong>${email}</strong> (${language})</p>
               <p>${people} people × ${hoursPerPersonPerWeek} h/week × €${hourlyCost}/h<br>
               ${result.hoursPerYear} hours a year, €${result.yearlyCost}<br>
               Tasks: ${tasks.length ? tasks.join(", ") : "none selected"}</p>`,
      });
    } catch (error) {
      console.error("Internal notification failed:", error);
    }
  }

  return json({ ok: true, reportSent });
});
