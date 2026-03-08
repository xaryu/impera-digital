import heroBg from "@/assets/hero-bg.jpg";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="Premium workspace collaboration" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
        <div className="absolute inset-0 bg-navy-dark/75" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {t("hero.eyebrow")}
        </p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-tight mb-8 opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          {t("hero.title1")}
          <br />
          <span className="text-gold-gradient">{t("hero.title2")}</span>
        </h1>
        <p className="font-body text-lg md:text-xl text-gold-muted max-w-2xl mx-auto mb-12 opacity-0 animate-fade-up" style={{ animationDelay: "0.6s" }}>
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "0.8s" }}>
          <LocalizedLink to="/contact" className="px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase btn-hover hover:bg-gold-light">
            {t("hero.cta1")}
          </LocalizedLink>
          <LocalizedLink to="/about" className="px-10 py-4 border border-gold/40 text-cream font-body text-sm tracking-wider uppercase btn-hover hover:bg-gold/10">
            {t("hero.cta2")}
          </LocalizedLink>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <span className="text-gold-muted text-xs tracking-widest uppercase font-body">{t("hero.scroll")}</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
