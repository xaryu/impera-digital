import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";
import CalendlyDialog from "./CalendlyDialog";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section id="contact" className="py-32 bg-navy-gradient relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <FadeInSection>
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("cta.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-cream mb-8 leading-tight">
            {t("cta.title1")}
            <br />
            {t("cta.title2")}
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-12">{t("cta.subtitle")}</p>
          <CalendlyDialog>
            <button className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase btn-hover hover:bg-gold-light">
              {t("cta.button")}
            </button>
          </CalendlyDialog>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CTASection;
