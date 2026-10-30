import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Slider } from "@/components/ui/slider";

interface NumberStepProps {
  stepId: "people" | "hours" | "cost";
  value: number | null;
  limits: { min: number; max: number; default: number };
  onChange: (value: number | null) => void;
  /** Shown before the input, e.g. a currency sign. */
  prefix?: string;
}

// A slider and a number input editing the same value, so keyboard and screen-reader users never
// depend on the slider. An empty or out-of-range input is kept as typed and blocks "Next".
const NumberStep = ({ stepId, value, limits, onChange, prefix }: NumberStepProps) => {
  const { t } = useTranslation();
  const id = useId();
  const valid = value !== null && Number.isInteger(value) && value >= limits.min && value <= limits.max;
  const sliderValue = Math.min(limits.max, Math.max(limits.min, value ?? limits.default));
  const key = `calculator.steps.${stepId}`;
  const inputLabel = t(`${key}.inputLabel`);

  return (
    <div className="space-y-6">
      <p className="font-body text-sm text-gold-muted">{t(`${key}.help`, { default: limits.default })}</p>
      <Slider
        min={limits.min}
        max={limits.max}
        step={1}
        value={[sliderValue]}
        onValueChange={([next]) => onChange(next)}
        thumbLabel={inputLabel}
        className="[&>span:first-child]:bg-navy-dark [&>span:first-child>span]:bg-gold [&_[role=slider]]:border-gold [&_[role=slider]]:bg-navy"
      />
      <div>
        <label htmlFor={id} className="block font-body text-xs tracking-wider text-gold uppercase mb-2">
          {inputLabel}
        </label>
        <div className="flex items-center gap-3">
          {prefix && <span className="font-display text-2xl text-cream">{prefix}</span>}
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={limits.min}
            max={limits.max}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : `${id}-error`}
            className="w-28 px-4 py-3 rounded-lg bg-navy-dark border border-navy-light/50 text-cream font-body text-lg min-h-[44px] focus:outline-none focus:border-gold/60 transition-colors"
          />
          <span className="font-body text-sm text-gold-muted">{t(`${key}.unit`)}</span>
        </div>
        {!valid && (
          <p id={`${id}-error`} className="text-red-400 text-xs font-body mt-2" role="alert">
            {t(`${key}.error`, { min: limits.min, max: limits.max })}
          </p>
        )}
      </div>
    </div>
  );
};

export default NumberStep;
