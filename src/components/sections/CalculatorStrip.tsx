// The band that follows the pain-points section: it turns "you are losing
// hours" into a number the visitor works out for themselves. It owns both
// dialogs so the Growth Audit CTA inside the result can hand over to Calendly
// without nesting one modal inside another.
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calculator } from "lucide-react";

import FadeInSection from "@/components/common/FadeInSection";
import CalendlyDialog from "@/components/common/CalendlyDialog";
import HoursCalculatorModal from "@/components/calculator/HoursCalculatorModal";

const CalculatorStrip = () => {
  const { t } = useTranslation();
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The calculator is driven from state rather than a DialogTrigger, so nothing
  // puts focus back on the button a keyboard visitor pressed. Do it by hand,
  // after the dialog has finished tearing itself down.
  const handleCalculatorOpenChange = (next: boolean) => {
    setCalculatorOpen(next);
    if (!next) setTimeout(() => triggerRef.current?.focus(), 0);
  };

  // Hands over to Calendly: focus belongs in that dialog, not back on the strip.
  const handleAuditClick = () => {
    setCalculatorOpen(false);
    setCalendlyOpen(true);
  };

  return (
    <section className="relative py-14 md:py-20 bg-navy border-y border-gold/20 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-6">
        <FadeInSection>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 max-w-5xl mx-auto">
            <div className="max-w-2xl">
              <p className="font-body text-xs tracking-[0.3em] text-gold uppercase mb-3">{t("calculator.strip.eyebrow")}</p>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-cream leading-tight">
                {t("calculator.strip.title")}
              </h2>
              <p className="font-body text-sm md:text-base text-gold-muted leading-relaxed mt-3">
                {t("calculator.strip.description")}
              </p>
            </div>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setCalculatorOpen(true)}
              className="btn-hover inline-flex items-center justify-center gap-2.5 shrink-0 px-8 py-4 bg-gold text-navy-dark font-display font-bold text-sm tracking-wider uppercase hover:bg-gold-light rounded-md min-h-[48px]"
            >
              <Calculator className="w-4 h-4" aria-hidden="true" />
              {t("calculator.strip.cta")}
            </button>
          </div>
        </FadeInSection>
      </div>

      <HoursCalculatorModal open={calculatorOpen} onOpenChange={handleCalculatorOpenChange} onAuditClick={handleAuditClick} />
      <CalendlyDialog open={calendlyOpen} onOpenChange={setCalendlyOpen} />
    </section>
  );
};

export default CalculatorStrip;
