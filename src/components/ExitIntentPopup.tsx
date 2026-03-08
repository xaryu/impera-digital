import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z
  .string()
  .trim()
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email is too long" });

const STORAGE_KEY = "impera_exit_popup_dismissed";

const ExitIntentPopup = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    let triggered = false;
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !triggered) {
        triggered = true;
        setVisible(true);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error: dbError } = await supabase.from("leads").insert({ email: result.data, source: "exit_intent" });
    setSubmitting(false);
    if (dbError) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    toast.success(t("exitPopup.success"));
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={dismiss} />
      <div className="relative w-full max-w-md bg-navy rounded-2xl border border-navy-light/40 shadow-2xl animate-scale-in overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-gold/40 via-gold to-gold/40" />
        <button onClick={dismiss} className="absolute top-4 right-4 text-gold-muted/60 hover:text-cream transition-colors" aria-label="Close popup">
          <X className="w-5 h-5" />
        </button>
        <div className="px-8 pt-8 pb-6 text-center">
          <p className="font-body text-xs tracking-[0.35em] text-gold uppercase mb-3">{t("exitPopup.eyebrow")}</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cream leading-tight mb-3">{t("exitPopup.title")}</h2>
          <p className="font-body text-sm text-gold-muted leading-relaxed mb-6 max-w-xs mx-auto">
            {t("exitPopup.description")}{" "}
            <span className="text-cream font-medium">{t("exitPopup.guideName")}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder={t("exitPopup.placeholder")} className="w-full px-4 py-3 rounded-lg bg-navy-dark border border-navy-light/50 text-cream placeholder:text-gold-muted/50 font-body text-sm focus:outline-none focus:border-gold/60 transition-colors" maxLength={255} autoComplete="email" />
              {error && <p className="text-red-400 text-xs font-body mt-1.5 text-left">{error}</p>}
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg bg-gold text-navy-dark font-display font-bold text-sm tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-60">
              {submitting ? t("exitPopup.sending") : t("exitPopup.submit")}
            </button>
          </form>
          <button onClick={dismiss} className="mt-4 font-body text-xs text-gold-muted/50 hover:text-gold-muted transition-colors">{t("exitPopup.noThanks")}</button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
