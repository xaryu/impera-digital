import { useCallback, useEffect, useReducer, useRef, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { calculator, type CalculatorTaskId } from "@/config/calculator";
import { supabase } from "@/integrations/supabase/client";
import { inputsSchema } from "@/lib/calculator";
import { newRunId, toTrackLanguage, track } from "@/lib/track";
import DoneView from "./steps/DoneView";
import EmailStep from "./steps/EmailStep";
import NumberStep from "./steps/NumberStep";
import ResultView from "./steps/ResultView";
import TasksStep from "./steps/TasksStep";

const INPUT_STEPS = ["people", "hours", "cost", "tasks"] as const;
type Step = (typeof INPUT_STEPS)[number] | "result" | "email" | "done";

// Error messages are dictionary keys, translated when shown.
const emailSchema = z
  .string()
  .trim()
  .email({ message: "calculator.email.invalidEmail" })
  .max(255, { message: "calculator.email.emailTooLong" });

// The number fields are null while the visitor has cleared the input.
interface State {
  step: Step;
  people: number | null;
  hoursPerPerson: number | null;
  hourlyCost: number | null;
  tasks: CalculatorTaskId[];
}

type Action =
  | { type: "set"; field: "people" | "hoursPerPerson" | "hourlyCost"; value: number | null }
  | { type: "toggleTask"; id: CalculatorTaskId }
  | { type: "goTo"; step: Step }
  | { type: "reset" };

const initialState: State = {
  step: "people",
  people: calculator.people.default,
  hoursPerPerson: calculator.hoursPerWeek.default,
  hourlyCost: calculator.hourlyCost.default,
  tasks: [],
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "set":
      return { ...state, [action.field]: action.value };
    case "toggleTask":
      return {
        ...state,
        tasks: state.tasks.includes(action.id)
          ? state.tasks.filter((id) => id !== action.id)
          : [...state.tasks, action.id],
      };
    case "goTo":
      return { ...state, step: action.step };
    case "reset":
      return initialState;
  }
};

// Focus the question when a step appears, so keyboard and screen-reader users land on it.
const focusOnMount = (element: HTMLElement | null) => element?.focus();

interface HoursCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where focus goes on close. Radix only does this for a Dialog.Trigger, which we don't use. */
  returnFocusRef?: RefObject<HTMLElement>;
}

// The reducer lives here, above the dialog content, so closing and reopening within the same page
// view keeps the visitor's inputs.
const HoursCalculatorModal = ({ open, onOpenChange, returnFocusRef }: HoursCalculatorModalProps) => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step } = state;

  // One run = one modal open, or one "start over". The id lives in memory only (see lib/track.ts).
  const runId = useRef<string | null>(null);
  const finishedRunId = useRef<string | null>(null);

  const startRun = useCallback(() => {
    runId.current = newRunId();
    track("started", runId.current, i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    if (!open) runId.current = null;
    else if (!runId.current) startRun();
  }, [open, startRun]);

  useEffect(() => {
    if (step !== "result" || !runId.current || finishedRunId.current === runId.current) return;
    finishedRunId.current = runId.current;
    track("finished", runId.current, i18n.language);
  }, [step, i18n.language]);

  const onAuditClick = useCallback(() => {
    if (runId.current) track("audit_clicked", runId.current, i18n.language);
  }, [i18n.language]);

  // The email step. Kept outside the reducer: it is not part of the estimate and "start over" clears it.
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const validation = inputsSchema.safeParse(state);

  const submitEmail = async () => {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return setEmailError(parsedEmail.error.errors[0].message);
    if (!consent) return setEmailError("calculator.email.consentRequired");
    if (!validation.success) return;

    setEmailError(null);
    setSending(true);
    const { error } = await supabase.functions.invoke("calculator-report", {
      body: {
        email: parsedEmail.data,
        language: toTrackLanguage(i18n.language),
        inputs: validation.data,
        consent: true,
        website,
      },
    });
    setSending(false);

    // 429 = this address already asked within the last few minutes, so a report is on its way.
    const alreadySent = (error as { context?: { status?: number } } | null)?.context?.status === 429;
    if (error && !alreadySent) return setEmailError("calculator.email.error");

    if (runId.current) track("email_submitted", runId.current, i18n.language);
    dispatch({ type: "goTo", step: "done" });
  };

  const stepValid = (() => {
    if (step === "tasks") return state.tasks.length > 0;
    if (step === "result" || step === "email" || step === "done") return true;
    const field = { people: "people", hours: "hoursPerPerson", cost: "hourlyCost" }[step] as
      | "people"
      | "hoursPerPerson"
      | "hourlyCost";
    return inputsSchema.shape[field].safeParse(state[field]).success;
  })();

  const stepIndex = INPUT_STEPS.indexOf(step as (typeof INPUT_STEPS)[number]);
  const isInputStep = stepIndex >= 0;
  const isLastInputStep = stepIndex === INPUT_STEPS.length - 1;

  const goNext = () => {
    if (!stepValid || !isInputStep) return;
    dispatch({ type: "goTo", step: isLastInputStep ? "result" : INPUT_STEPS[stepIndex + 1] });
  };

  const goBack = () => {
    if (step === "email") dispatch({ type: "goTo", step: "result" });
    else if (step === "result") dispatch({ type: "goTo", step: "tasks" });
    else if (stepIndex > 0) dispatch({ type: "goTo", step: INPUT_STEPS[stepIndex - 1] });
  };

  const onStartOver = useCallback(() => {
    dispatch({ type: "reset" });
    setEmail("");
    setConsent(false);
    setWebsite("");
    setEmailError(null);
    startRun();
  }, [startRun]);

  const question = {
    result: t("calculator.result.title"),
    email: t("calculator.email.title"),
    done: t("calculator.done.title"),
  }[step as "result" | "email" | "done"] ?? t(`calculator.steps.${step}.label`);
  const progressText = isInputStep
    ? t("calculator.modal.progress", { current: stepIndex + 1, total: INPUT_STEPS.length })
    : t("calculator.a11y.resultShown");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        closeLabel={t("calculator.a11y.close")}
        // Our own question takes the focus on each step (see focusOnMount).
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef?.current?.focus();
        }}
        className="flex flex-col gap-0 p-0 bg-navy border border-gold/20 text-cream max-w-lg max-h-[100dvh] max-sm:left-0 max-sm:top-0 max-sm:h-[100dvh] max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none sm:max-h-[90vh]"
      >
        <div className="px-6 pt-6 pb-4 pr-12">
          <DialogTitle className="font-display text-xl text-cream leading-snug">
            {t("calculator.modal.title")}
          </DialogTitle>
          {isInputStep && (
            <div className="mt-4 space-y-2">
              <p className="font-body text-xs text-gold-muted">{progressText}</p>
              <Progress
                value={((stepIndex + 1) / INPUT_STEPS.length) * 100}
                aria-label={progressText}
                className="h-1.5 bg-navy-dark [&>div]:bg-gold"
              />
            </div>
          )}
          {/* Announces each step to screen readers; the visible progress above is not live. */}
          <p className="sr-only" aria-live="polite">
            {progressText}
          </p>
        </div>

        <form
          noValidate // our own translated messages replace the browser's native tooltips
          className="flex flex-1 flex-col min-h-0"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === "email") void submitEmail();
            else goNext();
          }}
        >
          <div className="flex-1 overflow-y-auto px-6 pb-4">
            <DialogDescription
              key={step}
              ref={focusOnMount}
              tabIndex={-1}
              className="font-display text-lg font-semibold text-cream mb-5 focus:outline-none"
            >
              {question}
            </DialogDescription>

            {step === "people" && (
              <NumberStep
                stepId="people"
                value={state.people}
                limits={calculator.people}
                onChange={(value) => dispatch({ type: "set", field: "people", value })}
              />
            )}
            {step === "hours" && (
              <NumberStep
                stepId="hours"
                value={state.hoursPerPerson}
                limits={calculator.hoursPerWeek}
                onChange={(value) => dispatch({ type: "set", field: "hoursPerPerson", value })}
              />
            )}
            {step === "cost" && (
              <NumberStep
                stepId="cost"
                value={state.hourlyCost}
                limits={calculator.hourlyCost}
                prefix="€"
                onChange={(value) => dispatch({ type: "set", field: "hourlyCost", value })}
              />
            )}
            {step === "tasks" && (
              <TasksStep selected={state.tasks} onToggle={(id) => dispatch({ type: "toggleTask", id })} />
            )}
            {step === "result" && validation.success && (
              <ResultView
                inputs={validation.data}
                onStartOver={onStartOver}
                onAuditClick={onAuditClick}
                onEmailClick={() => dispatch({ type: "goTo", step: "email" })}
              />
            )}
            {step === "email" && (
              <EmailStep
                email={email}
                consent={consent}
                website={website}
                error={emailError}
                onEmailChange={(value) => {
                  setEmail(value);
                  setEmailError(null);
                }}
                onConsentChange={(value) => {
                  setConsent(value);
                  setEmailError(null);
                }}
                onWebsiteChange={setWebsite}
              />
            )}
            {step === "done" && <DoneView onAuditClick={onAuditClick} />}
          </div>

          {step === "email" && (
            <div className="flex items-center justify-between gap-3 border-t border-navy-light/40 px-6 py-4">
              <button
                type="button"
                onClick={goBack}
                className="min-h-[44px] px-4 font-body text-sm text-gold-muted hover:text-cream transition-colors"
              >
                {t("calculator.modal.back")}
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-8 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? t("calculator.email.sending") : t("calculator.email.submit")}
              </button>
            </div>
          )}
          {isInputStep && (
            <div className="flex items-center justify-between gap-3 border-t border-navy-light/40 px-6 py-4">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="min-h-[44px] px-4 font-body text-sm text-gold-muted hover:text-cream transition-colors"
                >
                  {t("calculator.modal.back")}
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={!stepValid}
                className="px-8 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastInputStep ? t("calculator.modal.seeResult") : t("calculator.modal.next")}
              </button>
            </div>
          )}
          {step === "result" && (
            <div className="border-t border-navy-light/40 px-6 py-3">
              <button
                type="button"
                onClick={goBack}
                className="min-h-[44px] px-4 font-body text-sm text-gold-muted hover:text-cream transition-colors"
              >
                {t("calculator.modal.back")}
              </button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HoursCalculatorModal;
