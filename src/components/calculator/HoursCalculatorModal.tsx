// "How many hours is your team losing?" — four one-question steps, then an
// estimate the visitor sees without giving us anything. The email step below
// the result is an offer, not a gate.
//
// Accessibility comes from Radix's Dialog: focus is trapped inside the modal,
// Escape closes it, and focus returns to the strip button afterwards.
import { useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Check, Loader2, RotateCcw } from "lucide-react";
import { z } from "zod";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import LocalizedLink from "@/components/layout/LocalizedLink";
import CalculatorResult from "@/components/calculator/CalculatorResult";
import { calculatorModel, calculatorTasks, type CalculatorTaskId } from "@/config/calculator";
import { calculate, formatNumber } from "@/lib/calculator";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { cn, getErrorMessage } from "@/lib/utils";

const STEP_COUNT = 4;

// Error messages are dictionary keys, translated when shown — same approach as
// the exit-intent popup.
const emailSchema = z
  .string()
  .trim()
  .email({ message: "calculator.email.invalidEmail" })
  .max(255, { message: "calculator.email.emailTooLong" });

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

interface HoursCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Closes this modal and opens the Calendly dialog on the page behind it. */
  onAuditClick: () => void;
}

const HoursCalculatorModal = ({ open, onOpenChange, onAuditClick }: HoursCalculatorModalProps) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language?.slice(0, 2) || "en";

  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [people, setPeople] = useState<number>(calculatorModel.people.default);
  const [hoursEach, setHoursEach] = useState<number>(calculatorModel.hoursPerPersonPerWeek.default);
  const [hourlyCost, setHourlyCost] = useState<number>(calculatorModel.hourlyCost.default);
  const [hourlyCostText, setHourlyCostText] = useState(String(calculatorModel.hourlyCost.default));
  const [tasks, setTasks] = useState<CalculatorTaskId[]>([]);

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // `finished` is tracked once per run so re-opening the result (back, then
  // forward again) doesn't inflate the funnel.
  const finishedTracked = useRef(false);

  const result = useMemo(() => calculate({ people, hoursPerPersonPerWeek: hoursEach, hourlyCost }), [people, hoursEach, hourlyCost]);

  const inputs = useMemo(
    () => ({ people, hoursPerPersonPerWeek: hoursEach, hourlyCost, tasks }),
    [people, hoursEach, hourlyCost, tasks],
  );

  useEffect(() => {
    if (open) trackEvent("calculator_started", { language });
  }, [open, language]);

  const restart = () => {
    setStep(0);
    setShowResult(false);
    setSent(false);
    setEmailError("");
    finishedTracked.current = false;
  };

  const goToResult = () => {
    setShowResult(true);
    if (!finishedTracked.current) {
      finishedTracked.current = true;
      trackEvent("calculator_finished", {
        language,
        details: { ...inputs, hoursPerYear: result.hoursPerYear, yearlyCost: result.yearlyCost },
      });
    }
  };

  const next = () => (step === STEP_COUNT - 1 ? goToResult() : setStep((current) => current + 1));
  const back = () => (showResult ? setShowResult(false) : setStep((current) => Math.max(0, current - 1)));

  const toggleTask = (id: CalculatorTaskId) =>
    setTasks((current) => (current.includes(id) ? current.filter((task) => task !== id) : [...current, id]));

  const commitHourlyCost = (raw: string) => {
    const parsed = Number.parseInt(raw.replace(/[^0-9]/g, ""), 10);
    const value = Number.isFinite(parsed)
      ? clamp(parsed, calculatorModel.hourlyCost.min, calculatorModel.hourlyCost.max)
      : calculatorModel.hourlyCost.default;
    setHourlyCost(value);
    setHourlyCostText(String(value));
  };

  const handleAudit = () => {
    trackEvent("calculator_audit_clicked", { language, details: { hoursPerYear: result.hoursPerYear } });
    onAuditClick();
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailError("");

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(t(parsed.error.errors[0].message));
      return;
    }
    if (!consent) {
      setEmailError(t("calculator.email.consentRequired"));
      return;
    }

    setSending(true);
    try {
      // The edge function owns the write and the email: it stores the
      // submission with the service role and renders the report itself, so a
      // visitor can never dictate what we send or who we send it to.
      const { error } = await supabase.functions.invoke("send-calculator-report", {
        body: { email: parsed.data, consent: true, language, inputs, result },
      });
      if (error) throw error;
      setSent(true);
      trackEvent("calculator_email_submitted", { language, details: { tasks } });
    } catch (error) {
      console.error("Calculator report failed:", getErrorMessage(error));
      setEmailError(t("calculator.email.error"));
    } finally {
      setSending(false);
    }
  };

  const stepLabels = [
    t("calculator.people.label"),
    t("calculator.hours.label"),
    t("calculator.cost.label"),
    t("calculator.tasksStep.label"),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl w-[calc(100%-1.5rem)] max-h-[90vh] overflow-y-auto gap-0 p-0 bg-navy border border-gold/20 text-cream rounded-lg"
        aria-describedby="calculator-description"
      >
        <div className="h-1 w-full bg-gradient-to-r from-gold/40 via-gold to-gold/40 shrink-0" aria-hidden="true" />

        <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-7">
          <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-cream leading-tight pr-8">
            {t("calculator.modal.title")}
          </DialogTitle>
          <DialogDescription id="calculator-description" className="font-body text-sm text-gold-muted mt-2">
            {t("calculator.modal.description")}
          </DialogDescription>

          {!showResult && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-body text-xs tracking-[0.25em] text-gold uppercase">
                  {t("calculator.modal.progress", { current: step + 1, total: STEP_COUNT })}
                </p>
              </div>
              <Progress
                value={((step + 1) / STEP_COUNT) * 100}
                className="h-1 bg-navy-dark [&>div]:bg-gold"
                aria-label={t("calculator.modal.progress", { current: step + 1, total: STEP_COUNT })}
              />
            </div>
          )}

          {showResult ? (
            <CalculatorResult
              result={result}
              inputs={{ people, hoursEach, hourlyCost }}
              language={language}
              onAudit={handleAudit}
            />
          ) : (
            <div className="mt-7">
              <h3 className="font-display text-lg sm:text-xl text-cream font-semibold leading-snug">{stepLabels[step]}</h3>

              {step === 0 && (
                <StepSlider
                  value={people}
                  onChange={setPeople}
                  range={calculatorModel.people}
                  unit={t("calculator.people.unit")}
                  help={t("calculator.people.help")}
                  label={stepLabels[0]}
                  language={language}
                />
              )}

              {step === 1 && (
                <StepSlider
                  value={hoursEach}
                  onChange={setHoursEach}
                  range={calculatorModel.hoursPerPersonPerWeek}
                  unit={t("calculator.hours.unit")}
                  help={t("calculator.hours.help")}
                  label={stepLabels[1]}
                  language={language}
                />
              )}

              {step === 2 && (
                <div className="mt-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-2xl text-gold pointer-events-none" aria-hidden="true">
                        €
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={hourlyCostText}
                        aria-label={t("calculator.cost.inputLabel")}
                        onChange={(event) => setHourlyCostText(event.target.value)}
                        onBlur={(event) => commitHourlyCost(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            commitHourlyCost(hourlyCostText);
                            next();
                          }
                        }}
                        className="w-40 pl-11 pr-4 py-3 bg-navy-dark border border-navy-light/60 rounded-lg font-display text-2xl text-cream focus:outline-none focus:border-gold/60 transition-colors"
                      />
                    </div>
                    <span className="font-body text-sm text-gold-muted">{t("calculator.cost.unit")}</span>
                  </div>
                  <p className="font-body text-sm text-gold-muted/90 leading-relaxed mt-4">{t("calculator.cost.help")}</p>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6">
                  <div className="grid sm:grid-cols-2 gap-2.5" role="group" aria-label={stepLabels[3]}>
                    {calculatorTasks.map((task) => {
                      const checked = tasks.includes(task.id);
                      return (
                        <label
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors rounded-md min-h-[48px]",
                            checked ? "border-gold/60 bg-gold/10" : "border-navy-light/60 hover:border-gold/30",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-navy-dark data-[state=checked]:border-gold"
                          />
                          <span className="font-body text-sm text-cream">{t(`calculator.tasks.${task.id}`)}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="font-body text-sm text-gold-muted/90 leading-relaxed mt-4">{t("calculator.tasksStep.help")}</p>
                  <p className="font-body text-xs text-gold-muted/60 mt-1">{t("calculator.tasksStep.optional")}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 mt-8">
            {step > 0 || showResult ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex items-center gap-2 font-body text-sm text-gold-muted hover:text-cream transition-colors min-h-[44px] px-1"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {t("calculator.modal.back")}
              </button>
            ) : (
              <span />
            )}

            {showResult ? (
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 font-body text-sm text-gold-muted hover:text-cream transition-colors min-h-[44px] px-1"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                {t("calculator.modal.startOver")}
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark font-display font-bold text-sm tracking-wider uppercase hover:bg-gold-light transition-colors rounded-md min-h-[44px]"
              >
                {step === STEP_COUNT - 1 ? t("calculator.modal.seeResult") : t("calculator.modal.next")}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Email step — an offer under the result, never a gate in front of it */}
          {showResult && (
            <div className="mt-8 pt-7 border-t border-gold/15">
              {sent ? (
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />
                  <div role="status">
                    <p className="font-display text-base text-cream font-semibold">{t("calculator.email.success")}</p>
                    <p className="font-body text-sm text-gold-muted mt-1">{t("calculator.email.successNote")}</p>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-lg text-cream font-semibold">{t("calculator.email.title")}</h3>
                  <p className="font-body text-sm text-gold-muted mt-2">{t("calculator.email.description")}</p>
                  <ul className="mt-3 space-y-1.5">
                    {[t("calculator.email.bullet1"), t("calculator.email.bullet2"), t("calculator.email.bullet3")].map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 font-body text-sm text-cream/80">
                        <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3" noValidate>
                    <div>
                      <label htmlFor="calculator-email" className="sr-only">
                        {t("calculator.email.label")}
                      </label>
                      <input
                        id="calculator-email"
                        type="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailError("");
                        }}
                        placeholder={t("calculator.email.placeholder")}
                        maxLength={255}
                        autoComplete="email"
                        aria-invalid={!!emailError}
                        aria-describedby={emailError ? "calculator-email-error" : undefined}
                        className="w-full px-4 py-3 rounded-lg bg-navy-dark border border-navy-light/60 text-cream placeholder:text-gold-muted/50 font-body text-sm focus:outline-none focus:border-gold/60 transition-colors"
                      />
                    </div>

                    <label htmlFor="calculator-consent" className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        id="calculator-consent"
                        checked={consent}
                        onCheckedChange={(value) => {
                          setConsent(value === true);
                          setEmailError("");
                        }}
                        className="mt-0.5 border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-navy-dark data-[state=checked]:border-gold"
                      />
                      <span className="font-body text-xs text-gold-muted leading-relaxed">
                        <Trans
                          i18nKey="calculator.email.consent"
                          components={{
                            link: (
                              <LocalizedLink
                                to="/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-gold transition-colors"
                              />
                            ),
                          }}
                        />
                      </span>
                    </label>

                    {emailError && (
                      <p id="calculator-email-error" className="text-red-400 text-xs font-body" role="alert">
                        {emailError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg border border-gold/50 text-gold font-display font-bold text-sm tracking-wider uppercase hover:bg-gold hover:text-navy-dark transition-colors disabled:opacity-60 min-h-[44px]"
                    >
                      {sending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                      {sending ? t("calculator.email.sending") : t("calculator.email.submit")}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface StepSliderProps {
  value: number;
  onChange: (value: number) => void;
  range: { min: number; max: number; step: number };
  unit: string;
  help: string;
  label: string;
  language: string;
}

const StepSlider = ({ value, onChange, range, unit, help, label, language }: StepSliderProps) => (
  <div className="mt-6">
    <div className="flex items-baseline gap-3">
      <span className="font-display text-5xl font-bold text-gold tabular-nums">{formatNumber(value, language)}</span>
      <span className="font-body text-sm text-gold-muted">{unit}</span>
    </div>
    <Slider
      value={[value]}
      min={range.min}
      max={range.max}
      step={range.step}
      onValueChange={([next]) => onChange(next)}
      thumbLabel={label}
      className="mt-5 [&>span:first-child]:bg-navy-dark [&>span:first-child>span]:bg-gold [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-gold [&_[role=slider]]:bg-cream"
    />
    <div className="flex justify-between mt-2 font-body text-xs text-gold-muted/60 tabular-nums">
      <span>{range.min}</span>
      <span>{range.max}</span>
    </div>
    <p className="font-body text-sm text-gold-muted/90 leading-relaxed mt-5">{help}</p>
  </div>
);

export default HoursCalculatorModal;
