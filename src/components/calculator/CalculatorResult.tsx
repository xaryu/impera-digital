// The estimate screen: three figures from the visitor's own numbers, the band
// of what could realistically be automated, and — in small print directly
// underneath — every assumption the figures rest on.
import { useTranslation } from "react-i18next";
import { CalendarCheck } from "lucide-react";

import { calculatorModel } from "@/config/calculator";
import { automationPercentages, formatEuro, formatNumber, type CalculatorResult as Result } from "@/lib/calculator";

interface CalculatorResultProps {
  result: Result;
  inputs: { people: number; hoursEach: number; hourlyCost: number };
  language: string;
  onAudit: () => void;
}

const CalculatorResult = ({ result, inputs, language, onAudit }: CalculatorResultProps) => {
  const { t } = useTranslation();
  const { automatable } = result;

  const stats = [
    { label: t("calculator.result.hoursPerWeek"), value: formatNumber(result.hoursPerWeek, language) },
    { label: t("calculator.result.hoursPerYear"), value: formatNumber(result.hoursPerYear, language) },
    { label: t("calculator.result.yearlyCost"), value: formatEuro(result.yearlyCost, language) },
  ];

  const assumptions = [
    t("calculator.result.assumption1", {
      people: formatNumber(inputs.people, language),
      hours: formatNumber(inputs.hoursEach, language),
      cost: formatEuro(inputs.hourlyCost, language),
    }),
    t("calculator.result.assumption2", { weeks: calculatorModel.workingWeeksPerYear }),
    t("calculator.result.assumption3", automationPercentages),
    t("calculator.result.assumption4"),
  ];

  return (
    <div className="mt-6">
      <p className="font-body text-xs tracking-[0.25em] text-gold uppercase">{t("calculator.result.eyebrow")}</p>
      <h3 className="font-display text-xl sm:text-2xl text-cream font-bold mt-2">{t("calculator.result.title")}</h3>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-navy-dark/60 border border-navy-light/40 rounded-md px-4 py-4">
            <dd className="font-display text-2xl sm:text-[1.75rem] leading-none font-bold text-cream tabular-nums">{stat.value}</dd>
            <dt className="font-body text-xs text-gold-muted mt-2 leading-snug">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-4 border border-gold/30 bg-gold/5 rounded-md px-5 py-5">
        <p className="font-body text-xs tracking-[0.2em] text-gold uppercase">{t("calculator.result.rangeTitle")}</p>
        <p className="font-display text-2xl sm:text-3xl font-bold text-gold mt-2 tabular-nums">
          {t("calculator.result.rangeHours", {
            low: formatNumber(automatable.hoursLow, language),
            high: formatNumber(automatable.hoursHigh, language),
          })}
        </p>
        <p className="font-display text-lg text-cream mt-1 tabular-nums">
          {t("calculator.result.rangeCost", {
            low: formatEuro(automatable.costLow, language),
            high: formatEuro(automatable.costHigh, language),
          })}
        </p>
        <p className="font-body text-xs text-gold-muted mt-2">{t("calculator.result.rangeHelp", automationPercentages)}</p>
      </div>

      <p className="font-body text-sm text-cream/75 leading-relaxed mt-4">{t("calculator.result.estimateNote")}</p>

      <div className="mt-4">
        <p className="font-body text-[11px] tracking-[0.18em] text-gold-muted/70 uppercase">
          {t("calculator.result.assumptionsTitle")}
        </p>
        <ul className="mt-2 space-y-1.5">
          {assumptions.map((assumption) => (
            <li key={assumption} className="font-body text-[11px] text-gold-muted/70 leading-relaxed flex gap-2">
              <span aria-hidden="true">·</span>
              <span>{assumption}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onAudit}
        className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-navy-dark font-display font-bold text-sm tracking-wider uppercase hover:bg-gold-light transition-colors rounded-md min-h-[48px]"
      >
        <CalendarCheck className="w-4 h-4" aria-hidden="true" />
        {t("calculator.result.auditCta")}
      </button>
    </div>
  );
};

export default CalculatorResult;
