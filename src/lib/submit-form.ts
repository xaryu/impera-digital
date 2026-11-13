import { supabase } from "@/integrations/supabase/client";

// Body sent to the form-submit Edge Function (see supabase/functions/form-submit/index.ts). The
// browser cannot insert into the form tables directly any more.
export type FormSubmission =
  | { kind: "contact"; name: string; email: string; company: string; service: string; message: string; website: string }
  | { kind: "lead"; email: string; source: "exit_intent"; website: string }
  | {
      kind: "application";
      jobId: string;
      fullName: string;
      email: string;
      motivation: string;
      cvPath: string | null;
      website: string;
    };

// Returns null on success, otherwise the dictionary key of the message to show.
export const submitForm = async (body: FormSubmission): Promise<string | null> => {
  const { error } = await supabase.functions.invoke("form-submit", { body });
  if (!error) return null;
  const status = (error as { context?: { status?: number } }).context?.status;
  return status === 429 || status === 503 ? "common.rateLimited" : "common.genericError";
};

// The honeypot field shared by the public forms: hidden from people and assistive tech, filled by
// bots. No label and a neutral name, so autofill and password managers leave it alone.
export const honeypotProps = {
  type: "text",
  name: "form-ref",
  tabIndex: -1,
  autoComplete: "off",
  "data-lpignore": "true",
  "data-1p-ignore": true,
} as const;

export const honeypotWrapperClass = "absolute -left-[9999px] h-0 w-0 overflow-hidden";
