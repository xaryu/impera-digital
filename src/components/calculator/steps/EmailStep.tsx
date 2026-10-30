import { Trans, useTranslation } from "react-i18next";
import LocalizedLink from "@/components/layout/LocalizedLink";

interface EmailStepProps {
  email: string;
  consent: boolean;
  website: string;
  /** Dictionary key of the current error, if any (see emailSchema in HoursCalculatorModal). */
  error: string | null;
  onEmailChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onWebsiteChange: (value: string) => void;
}

const EmailStep = ({ email, consent, website, error, onEmailChange, onConsentChange, onWebsiteChange }: EmailStepProps) => {
  const { t } = useTranslation();
  const emailError = error && error !== "calculator.email.consentRequired" ? error : null;
  const consentError = error === "calculator.email.consentRequired" ? error : null;

  return (
    <div className="space-y-4">
      <div className="font-body text-sm text-gold-muted">
        <p>{t("calculator.email.description")}</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>{t("calculator.email.bullet1")}</li>
          <li>{t("calculator.email.bullet2")}</li>
          <li>{t("calculator.email.bullet3")}</li>
        </ul>
      </div>

      <div>
        <label htmlFor="calculator-email" className="block font-body text-sm text-cream mb-1.5">
          {t("calculator.email.label")}
        </label>
        <input
          id="calculator-email"
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder={t("calculator.email.placeholder")}
          maxLength={255}
          autoComplete="email"
          aria-invalid={!!emailError}
          aria-describedby={emailError ? "calculator-email-error" : undefined}
          className="w-full px-4 py-3 min-h-[44px] rounded-lg bg-navy-dark border border-navy-light/50 text-cream placeholder:text-gold-muted/50 font-body text-sm focus:outline-none focus:border-gold/60 transition-colors"
        />
        {emailError && (
          <p id="calculator-email-error" className="text-red-400 text-xs font-body mt-1.5" role="alert">
            {t(emailError)}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
          />
        </label>
      </div>

      <div>
        <label className="flex items-start gap-3 min-h-[44px] font-body text-sm text-gold-muted cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
            aria-invalid={!!consentError}
            aria-describedby={consentError ? "calculator-consent-error" : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-[#c9a24a]"
          />
          <span>
            <Trans
              i18nKey="calculator.email.consent"
              components={{
                link: (
                  <LocalizedLink
                    to="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline underline-offset-2 hover:text-gold-light"
                  />
                ),
              }}
            />
          </span>
        </label>
        {consentError && (
          <p id="calculator-consent-error" className="text-red-400 text-xs font-body mt-1" role="alert">
            {t(consentError)}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailStep;
