import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import FadeInSection from "@/components/common/FadeInSection";
import HoursCalculatorModal from "@/components/calculator/HoursCalculatorModal";

// Homepage entry to the hours-lost calculator. Owns the modal's open state; the modal stays mounted
// so the visitor's inputs survive closing and reopening it.
const HoursCalculatorStrip = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <section className="py-12 md:py-16 bg-navy" aria-labelledby="calculator-strip-title">
      <div className="container mx-auto px-6">
        <FadeInSection className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
          <div className="max-w-2xl">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-3">{t("calculator.strip.eyebrow")}</p>
            <h2 id="calculator-strip-title" className="font-display text-2xl md:text-4xl font-bold text-cream mb-3">
              {t("calculator.strip.title")}
            </h2>
            <p className="font-body text-gold-muted">{t("calculator.strip.description")}</p>
          </div>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase btn-hover hover:bg-gold-light"
          >
            {t("calculator.strip.cta")}
          </button>
        </FadeInSection>
      </div>
      <HoursCalculatorModal open={open} onOpenChange={setOpen} returnFocusRef={buttonRef} />
    </section>
  );
};

export default HoursCalculatorStrip;
