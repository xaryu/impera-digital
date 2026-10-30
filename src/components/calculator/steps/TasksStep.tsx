import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { calculator, type CalculatorTaskId } from "@/config/calculator";

interface TasksStepProps {
  selected: CalculatorTaskId[];
  onToggle: (id: CalculatorTaskId) => void;
}

// Real checkboxes styled as chips, inside a fieldset so screen readers announce the group.
const TasksStep = ({ selected, onToggle }: TasksStepProps) => {
  const { t } = useTranslation();
  // The error only appears once the visitor has interacted, so the step doesn't open in red.
  const [touched, setTouched] = useState(false);
  const showError = touched && selected.length === 0;

  return (
    <fieldset className="space-y-4">
      <legend className="font-body text-sm text-gold-muted mb-4">{t("calculator.steps.tasks.help")}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {calculator.tasks.map((task) => (
          <label
            key={task.id}
            className="relative flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg border border-navy-light/50 bg-navy-dark text-cream font-body text-sm cursor-pointer transition-colors hover:border-gold/40 has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold"
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={selected.includes(task.id)}
              onChange={() => {
                setTouched(true);
                onToggle(task.id);
              }}
              aria-describedby={showError ? "calculator-tasks-error" : undefined}
            />
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                selected.includes(task.id) ? "bg-gold border-gold" : "border-gold-muted/60"
              }`}
            >
              {selected.includes(task.id) && <Check className="h-3.5 w-3.5 text-navy-dark" />}
            </span>
            {t(`calculator.tasks.${task.id}`)}
          </label>
        ))}
      </div>
      {showError && (
        <p id="calculator-tasks-error" className="text-red-400 text-xs font-body" role="alert">
          {t("calculator.steps.tasks.error")}
        </p>
      )}
    </fieldset>
  );
};

export default TasksStep;
