import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/layout/LocalizedLink";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";

type Status = "idle" | "sending" | "sent" | "alreadySent" | "invalid" | "expired" | "busy" | "error";

// Where the link in the confirmation email lands (see calculator-report). The report is only sent
// when the button is pressed: a POST, so mail scanners that merely open the link cannot trigger it.
const CalculatorConfirm = () => {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>(token ? "idle" : "invalid");

  const confirm = async () => {
    setStatus("sending");
    const { data, error } = await supabase.functions.invoke("calculator-report", {
      body: { action: "confirm", token },
    });
    if (!error) return setStatus(data?.already_sent ? "alreadySent" : "sent");
    const code = (error as { context?: { status?: number } }).context?.status;
    setStatus(({ 404: "invalid", 400: "invalid", 410: "expired", 409: "busy" } as const)[code ?? 0] ?? "error");
  };

  const message = { sent: "sent", alreadySent: "alreadySent", invalid: "invalid", expired: "expired", busy: "busy", error: "error" } as const;
  const canConfirm = status === "idle" || status === "sending" || status === "error";

  return (
    <div className="min-h-screen flex flex-col bg-navy-dark">
      <Helmet>
        <title>{`${t("calculator.confirmPage.title")} — Impera`}</title>
        {/* A private, one-time page: keep it out of search, and keep the token out of Referer headers. */}
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-32 px-6">
        <div className="max-w-lg text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cream mb-4">
            {t("calculator.confirmPage.title")}
          </h1>

          {status === "idle" || status === "sending" ? (
            <p className="font-body text-gold-muted mb-8">{t("calculator.confirmPage.description")}</p>
          ) : (
            <p className="font-body text-gold-muted mb-8" role={status === "error" ? "alert" : "status"}>
              {t(`calculator.confirmPage.${message[status]}`)}
            </p>
          )}

          {canConfirm ? (
            <button
              type="button"
              onClick={() => void confirm()}
              disabled={status === "sending"}
              className="px-8 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? t("calculator.confirmPage.sending") : t("calculator.confirmPage.button")}
            </button>
          ) : (
            <LocalizedLink
              to="/"
              className="inline-block px-8 py-3 min-h-[44px] border border-gold/40 text-gold font-body text-sm font-semibold tracking-wider uppercase hover:border-gold transition-colors"
            >
              {t("calculator.confirmPage.back")}
            </LocalizedLink>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CalculatorConfirm;
