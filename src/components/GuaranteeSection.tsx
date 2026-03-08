import { useTranslation } from "react-i18next";
import FadeInSection from "@/components/FadeInSection";
import { ShieldCheck, BarChart3, Clock, UserCheck, ArrowRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const GuaranteeSection = () => {
  const { t } = useTranslation();

  const guaranteePoints = [
    { icon: BarChart3, text: t("guarantee.point1") },
    { icon: Clock, text: t("guarantee.point2") },
    { icon: UserCheck, text: t("guarantee.point3") },
  ];

  return (
    <section className="relative py-24 md:py-32 bg-navy overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 border border-gold/30 bg-navy-dark/50">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span className="font-body text-xs tracking-[0.3em] text-gold uppercase">{t("guarantee.badge")}</span>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={100}>
            <h2 className="font-display text-3xl md:text-5xl text-cream font-bold text-center mb-6">{t("guarantee.title")}</h2>
          </FadeInSection>

          <FadeInSection delay={200}>
            <p className="font-body text-cream/70 text-center text-lg max-w-2xl mx-auto mb-14 leading-relaxed">
              {t("guarantee.subtitle").split("<1>")[0]}
              <span className="text-gold font-medium">
                {t("guarantee.subtitle").match(/<1>(.*?)<\/1>/)?.[1] || "90 days"}
              </span>
              {t("guarantee.subtitle").split("</1>")[1] || ""}
            </p>
          </FadeInSection>

          <div className="space-y-5 mb-14">
            {guaranteePoints.map((point, i) => (
              <FadeInSection key={i} delay={300 + i * 100}>
                <div className="flex items-start gap-5 bg-navy-dark/40 border border-navy-light/20 p-6 hover:border-gold/25 transition-colors duration-500">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <point.icon className="w-4.5 h-4.5 text-gold" />
                  </div>
                  <p className="font-body text-cream/85 leading-relaxed">{point.text}</p>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={650}>
            <div className="relative bg-navy-dark/60 border border-gold/25 p-8 md:p-10 text-center mb-14">
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="font-display text-xl md:text-2xl text-cream leading-snug mb-4">{t("guarantee.promise")}</p>
              <p className="font-body text-cream/50 text-sm max-w-lg mx-auto leading-relaxed">{t("guarantee.promiseWhy")}</p>
            </div>
          </FadeInSection>

          <FadeInSection delay={800}>
            <div className="text-center">
              <LocalizedLink
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-navy-dark font-body text-sm tracking-wider uppercase font-semibold hover:bg-gold-light transition-colors duration-300"
              >
                {t("guarantee.cta")}
                <ArrowRight className="w-4 h-4" />
              </LocalizedLink>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default GuaranteeSection;
