import { Globe, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";

const WhyImperaSection = () => {
  const { t } = useTranslation();

  const differentiators = [
    {
      icon: Globe,
      title: t("whyImpera.multilingualTitle"),
      headline: t("whyImpera.multilingualHeadline"),
      points: [t("whyImpera.multilingualP1"), t("whyImpera.multilingualP2"), t("whyImpera.multilingualP3")],
    },
    {
      icon: TrendingUp,
      title: t("whyImpera.roiTitle"),
      headline: t("whyImpera.roiHeadline"),
      points: [t("whyImpera.roiP1"), t("whyImpera.roiP2"), t("whyImpera.roiP3")],
    },
    {
      icon: Users,
      title: t("whyImpera.accessTitle"),
      headline: t("whyImpera.accessHeadline"),
      points: [t("whyImpera.accessP1"), t("whyImpera.accessP2"), t("whyImpera.accessP3")],
    },
  ];

  return (
    <section className="py-32 bg-navy-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-3xl" />
      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("whyImpera.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">
            {t("whyImpera.title")}
            <br />
            <span className="text-gold-gradient">{t("whyImpera.titleHighlight")}</span>
          </h2>
          <p className="font-body text-gold-muted max-w-2xl mx-auto leading-relaxed">{t("whyImpera.subtitle")}</p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {differentiators.map((item, i) => (
            <FadeInSection key={i} delay={i * 120}>
              <div className="h-full p-8 lg:p-10 border border-gold/10 bg-navy/40 hover:border-gold/25 transition-all duration-500 rounded-lg group">
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/15 transition-colors">
                  <item.icon className="w-7 h-7 text-gold" aria-hidden="true" />
                </div>
                <p className="font-body text-[11px] tracking-[0.3em] text-gold uppercase mb-2">{item.title}</p>
                <h3 className="font-display text-xl lg:text-2xl font-bold text-cream leading-snug mb-6">{item.headline}</h3>
                <ul className="space-y-4">
                  {item.points.map((point, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span className="font-body text-sm text-gold-muted leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyImperaSection;
