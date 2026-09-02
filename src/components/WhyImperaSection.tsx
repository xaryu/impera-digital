import { Scale, Calculator, HardHat, Building2, HeartPulse, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";

const WhyImperaSection = () => {
  const { t } = useTranslation();

  const results = [
    {
      icon: Scale,
      sector: t("results.legalSector"),
      stat: t("results.legalStat"),
      label: t("results.legalLabel"),
      description: t("results.legalDescription"),
    },
    {
      icon: Calculator,
      sector: t("results.financeSector"),
      stat: t("results.financeStat"),
      label: t("results.financeLabel"),
      description: t("results.financeDescription"),
    },
  ];

  const pending = [
    { icon: Building2, sector: t("results.realEstateSector") },
    { icon: HeartPulse, sector: t("results.medicalSector") },
    { icon: HardHat, sector: t("results.constructionSector") },
  ];

  return (
    <section className="py-32 bg-navy-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("results.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">
            {t("results.title")}
            <br />
            <span className="text-gold-gradient">{t("results.titleHighlight")}</span>
          </h2>
        </FadeInSection>

        {/* proven results + the in-progress case study, same card grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 mb-8">
          {results.map((r, i) => (
            <FadeInSection key={r.sector} delay={i * 120}>
              <div className="group h-full p-8 lg:p-10 rounded-2xl bg-navy/40 border border-gold/10 hover:border-gold/25 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(213,173,74,0.15)] transition-all duration-500">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/15 transition-colors">
                  <r.icon className="w-6 h-6 text-gold" aria-hidden="true" />
                </div>
                <p className="font-body text-[11px] tracking-[0.3em] text-gold uppercase mb-3">{r.sector}</p>
                <p className="font-display text-4xl lg:text-5xl font-bold text-gold-gradient leading-none mb-4">{r.stat}</p>
                <h3 className="font-display text-lg text-cream font-semibold leading-snug mb-3">{r.label}</h3>
                <p className="font-body text-sm text-gold-muted leading-relaxed">{r.description}</p>
              </div>
            </FadeInSection>
          ))}

          <FadeInSection delay={results.length * 120}>
            <div className="group h-full p-8 lg:p-10 rounded-2xl bg-navy/20 border-2 border-dashed border-gold/25 hover:border-gold/40 transition-all duration-500 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                  <HardHat className="w-6 h-6 text-gold" aria-hidden="true" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/5 px-3 py-1 text-[10px] font-body uppercase tracking-[0.2em] text-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
                  {t("results.inProgressBadge")}
                </span>
              </div>
              <p className="font-body text-[11px] tracking-[0.3em] text-gold uppercase mb-3">{t("results.constructionSector")}</p>
              <h3 className="font-display text-lg text-cream font-semibold leading-snug mb-3">{t("results.constructionLabel")}</h3>
              <p className="font-body text-sm text-gold-muted leading-relaxed flex-1">{t("results.constructionDescription")}</p>
            </div>
          </FadeInSection>
        </div>

        {/* smaller pending rows — real icons + a proper "pending" badge instead of a placeholder square */}
        <FadeInSection delay={(results.length + 1) * 120}>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {pending.map((p) => (
              <div
                key={p.sector}
                className="flex items-center gap-3 rounded-xl border border-gold/10 bg-navy/30 px-5 py-4 hover:border-gold/20 transition-colors duration-300"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                  <p.icon className="w-4 h-4 text-gold" aria-hidden="true" />
                </div>
                <span className="font-body text-sm text-cream flex-1">{p.sector}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-gold/15 px-2.5 py-1 text-[10px] font-body uppercase tracking-wide text-gold-muted shrink-0">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {t("results.statPending")}
                </span>
              </div>
            ))}
          </div>
        </FadeInSection>

        <FadeInSection delay={(results.length + 2) * 120}>
          <p className="text-center font-body text-xs text-gold-muted/60 italic max-w-xl mx-auto">
            {t("results.confidentialityNote")}
          </p>
        </FadeInSection>
      </div>
    </section>
  );
};

export default WhyImperaSection;
