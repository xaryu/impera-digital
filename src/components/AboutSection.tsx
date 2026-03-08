import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";

const AboutSection = () => {
  const { t } = useTranslation();

  const stats = [
    { value: t("about.stat1Value"), label: t("about.stat1Label") },
    { value: t("about.stat2Value"), label: t("about.stat2Label") },
    { value: t("about.stat3Value"), label: t("about.stat3Label") },
    { value: t("about.stat4Value"), label: t("about.stat4Label") },
  ];

  return (
    <section id="about" className="py-32 bg-navy-gradient">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeInSection>
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("about.eyebrow")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-8 leading-tight">
              {t("about.title1")}
              <br />
              {t("about.title2")} <span className="text-gold-gradient">{t("about.titleHighlight")}</span>
            </h2>
            <p className="font-body text-gold-muted leading-relaxed mb-6">{t("about.p1")}</p>
            <p className="font-body text-gold-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: t("about.p2") }} />
          </FadeInSection>

          <FadeInSection delay={150}>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <FadeInSection key={i} delay={200 + i * 80}>
                  <div className="p-8 border border-gold/15 text-center hover:border-gold/30 hover:scale-[1.03] transition-all duration-500">
                    <p className="font-display text-4xl font-bold text-gold mb-2">{stat.value}</p>
                    <p className="font-body text-xs tracking-wider text-gold-muted uppercase">{stat.label}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
