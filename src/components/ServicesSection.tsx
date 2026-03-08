import { Megaphone, Palette, TrendingUp, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    { icon: Palette, title: t("services.brandIdentity"), description: t("services.brandIdentityDesc") },
    { icon: Globe, title: t("services.webDesign"), description: t("services.webDesignDesc") },
    { icon: Megaphone, title: t("services.digitalMarketing"), description: t("services.digitalMarketingDesc") },
    { icon: TrendingUp, title: t("services.growthStrategy"), description: t("services.growthStrategyDesc") },
  ];

  return (
    <section id="services" className="py-32 bg-cream">
      <div className="container mx-auto px-6">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("services.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">{t("services.title")}</h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <FadeInSection key={i} delay={i * 100}>
              <div className="group p-8 bg-background border border-border hover:border-gold/30 transition-all duration-500 hover:gold-glow hover:scale-[1.02] hover:shadow-lg">
                <service.icon className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-xl font-semibold text-navy mb-3">{service.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
