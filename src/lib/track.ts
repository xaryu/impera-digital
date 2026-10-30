import { supabase } from "@/integrations/supabase/client";

export type CalculatorEvent = "started" | "finished" | "email_submitted" | "audit_clicked";
export type TrackLanguage = "en" | "fr" | "nl";

const LANGUAGES: TrackLanguage[] = ["en", "fr", "nl"];

export const toTrackLanguage = (language: string): TrackLanguage => {
  const base = language.slice(0, 2) as TrackLanguage;
  return LANGUAGES.includes(base) ? base : "en";
};

/** Random id for one calculator run. Kept in memory only: no cookie, no storage. */
export const newRunId = () => crypto.randomUUID();

/**
 * Log a funnel event to calculator_events. Fire-and-forget: never throws, never blocks the UI.
 * No personal data is sent, so no consent is needed. Mirrors to GA4 when it has loaded
 * (it only does after analytics consent).
 */
export const track = (event: CalculatorEvent, runId: string, language: string) => {
  const lang = toTrackLanguage(language);
  try {
    void supabase
      .from("calculator_events")
      .insert({ event, run_id: runId, language: lang })
      .then(
        () => undefined,
        () => undefined,
      );
    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    gtag?.("event", `calculator_${event}`, { language: lang });
  } catch {
    // Tracking must never affect the visitor.
  }
};
