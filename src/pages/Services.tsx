import { Megaphone, Palette, TrendingUp, Globe, ArrowRight, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocalizedLink from "@/components/LocalizedLink";
import CalendlyDialog from "@/components/CalendlyDialog";
import { useTranslation } from "react-i18next";

const serviceIcons = [Palette, Globe, Megaphone, TrendingUp];

const serviceKeys = [
  {
    titleKey: "brandIdentity",
    taglineKey: "brandIdentityTagline",
    descKey: "brandIdentityDesc",
    deliverables: ["brandD1", "brandD2", "brandD3", "brandD4", "brandD5"],
  },
  {
    titleKey: "webDesign",
    taglineKey: "webDesignTagline",
    descKey: "webDesignDesc",
    deliverables: ["webD1", "webD2", "webD3", "webD4", "webD5"],
  },
  {
    titleKey: "digitalMarketing",
    taglineKey: "digitalMarketingTagline",
    descKey: "digitalMarketingDesc",
    deliverables: ["marketingD1", "marketingD2", "marketingD3", "marketingD4", "marketingD5"],
  },
  {
    titleKey: "growthStrategy",
    taglineKey: "growthStrategyTagline",
    descKey: "growthStrategyDesc",
    deliverables: ["growthD1", "growthD2", "growthD3", "growthD4", "growthD5"],
  },
];

const Services = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <SEO title={`${t("servicesPage.title")} ${t("servicesPage.titleHighlight")} — Impera`} description={t("servicesPage.subtitle")} path="/services" />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            {t("servicesPage.eyebrow")}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            {t("servicesPage.title")} <span className="text-gold-gradient">{t("servicesPage.titleHighlight")}</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto mb-8">
            {t("servicesPage.subtitle")}
          </p>
          <p className="font-body text-base text-gold-muted/80 max-w-3xl mx-auto border-t border-gold/15 pt-8">
            <span className="text-gold font-semibold">{t("servicesPage.aiDiff")}</span> {t("servicesPage.aiDiffDesc")}
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="space-y-24">
            {serviceKeys.map((service, i) => {
              const Icon = serviceIcons[i];
              return (
                <div
                  key={service.titleKey}
                  className={`grid lg:grid-cols-2 gap-16 items-start ${i % 2 === 1 ? "lg:direction-rtl" : ""}`}
                >
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <Icon className="w-8 h-8 text-gold" />
                      <span className="font-display text-5xl font-bold text-gold/10">0{i + 1}</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3">
                      {t(`servicesPage.${service.titleKey}`)}
                    </h2>
                    <p className="font-body text-gold italic mb-6">{t(`servicesPage.${service.taglineKey}`)}</p>
                    <p className="font-body text-muted-foreground leading-relaxed mb-8">
                      {t(`servicesPage.${service.descKey}`)}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <CalendlyDialog>
                        <button className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300">
                          {t("servicesPage.bookFreeCall")}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </CalendlyDialog>
                      <LocalizedLink
                        to="/contact"
                        className="inline-flex items-center gap-2 px-8 py-3 border border-gold/40 text-navy font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
                      >
                        {t("servicesPage.requestQuote")}
                      </LocalizedLink>
                    </div>
                  </div>

                  <div className={`p-10 border border-border bg-background ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                    <h3 className="font-display text-lg font-semibold text-navy mb-6">
                      {t("servicesPage.whatYouReceive")}
                    </h3>
                    <ul className="space-y-4">
                      {service.deliverables.map((key) => (
                        <li key={key} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                          <span className="font-body text-sm text-muted-foreground">{t(`servicesPage.${key}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            {t("servicesPage.ctaTitle")}
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            {t("servicesPage.ctaDesc")}
          </p>
          <LocalizedLink
            to="/contact"
            className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            {t("servicesPage.ctaButton")}
          </LocalizedLink>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
