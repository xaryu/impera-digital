import { useTranslation } from "react-i18next";
import CalendlyDialog from "@/components/common/CalendlyDialog";
import { calculator } from "@/config/calculator";
import { computeResult, formatEuro, formatHours, type CalculatorInputs } from "@/lib/calculator";

interface ResultViewProps {
  inputs: CalculatorInputs;
  onStartOver: () => void;
  onAuditClick: () => void;
}

const percent = (share: number) => Math.round(share * 100);

const ResultView = ({ inputs, onStartOver, onAuditClick }: ResultViewProps) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const result = computeResult(inputs);
  const { low, high } = calculator.automationRange;

  const stats = [
    { label: t("calculator.result.hoursPerWeek"), value: formatHours(result.weeklyHours, lang) },
    { label: t("calculator.result.hoursPerYear"), value: formatHours(result.yearlyHours, lang) },
    { label: t("calculator.result.yearlyCost"), value: formatEuro(result.yearlyCost, lang) },
  ];

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-navy-light/50 bg-navy-dark px-4 py-3">
            <dt className="font-body text-xs text-gold-muted">{stat.label}</dt>
            <dd className="font-display text-2xl font-bold text-cream mt-1">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-4">
        <p className="font-body text-xs tracking-wider text-gold uppercase mb-2">{t("calculator.result.rangeTitle")}</p>
        <p className="font-display text-xl text-cream">
          {t("calculator.result.rangeHours", {
            low: formatHours(result.automatableHours.low, lang),
            high: formatHours(result.automatableHours.high, lang),
          })}
        </p>
        <p className="font-display text-xl text-gold mt-1">
          {t("calculator.result.rangeCost", {
            low: formatEuro(result.automatableCost.low, lang),
            high: formatEuro(result.automatableCost.high, lang),
          })}
        </p>
        <p className="font-body text-xs text-gold-muted mt-3">{t("calculator.result.estimateNote")}</p>
      </div>

      <div className="font-body text-xs text-gold-muted/80">
        <p className="font-semibold mb-1">{t("calculator.result.assumptionsTitle")}</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            {t("calculator.result.assumptionInputs", {
              people: inputs.people,
              hours: inputs.hoursPerPerson,
              cost: formatEuro(inputs.hourlyCost, lang),
            })}
          </li>
          <li>{t("calculator.result.assumptionWeeks", { weeks: calculator.workingWeeksPerYear })}</li>
          <li>{t("calculator.result.assumptionRange", { low: percent(low), high: percent(high) })}</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <CalendlyDialog>
          <button
            type="button"
            onClick={onAuditClick}
            className="px-6 py-3 min-h-[44px] bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
          >
            {t("calculator.result.auditCta")}
          </button>
        </CalendlyDialog>
        <button
          type="button"
          onClick={onStartOver}
          className="min-h-[44px] px-2 font-body text-sm text-gold-muted hover:text-cream underline underline-offset-4 transition-colors"
        >
          {t("calculator.modal.startOver")}
        </button>
      </div>
    </div>
  );
};

export default ResultView;
