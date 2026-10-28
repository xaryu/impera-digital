// Minimal first-party event tracking. Every event is written to the
// calculator_events table so the funnel can be read straight from Supabase,
// and mirrored to Google Analytics when the visitor has accepted analytics
// cookies (the gtag script is only injected after consent — see
// src/hooks/use-tracking-consent.ts).
//
// Nothing here identifies a visitor: the session id is generated in memory on
// page load and never written to a cookie or to localStorage.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export type TrackedEvent =
  | "calculator_started"
  | "calculator_finished"
  | "calculator_email_submitted"
  | "calculator_audit_clicked";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const sessionId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export interface TrackOptions {
  language: string;
  /** Anonymous context — inputs and results, never personal data. */
  details?: Record<string, Json>;
}

/**
 * Fire-and-forget: tracking must never block the UI or surface an error to the
 * visitor, so every failure here is swallowed deliberately.
 */
export const trackEvent = (event: TrackedEvent, { language, details = {} }: TrackOptions): void => {
  try {
    window.gtag?.("event", event, { ...details, language });
  } catch {
    // Analytics is best-effort.
  }

  void supabase
    .from("calculator_events")
    .insert({ event, session_id: sessionId, language, details })
    .then(
      () => undefined,
      () => undefined,
    );
};
