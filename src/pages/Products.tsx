import { useTranslation } from "react-i18next";
import { ArrowRight, Bot, Check, Clock, FileSearch, Workflow, Zap } from "lucide-react";
import SEO from "@/components/layout/SEO";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/sections/PageHero";
import FadeInSection from "@/components/common/FadeInSection";
import LocalizedLink from "@/components/layout/LocalizedLink";

const Products = () => {
  const { t } = useTranslation();

  const products = [
    {
      id: "document-intelligence",
      icon: FileSearch,
      title: t("productsPage.p1Title"),
      tagline: t("productsPage.p1Tagline"),
      description: t("productsPage.p1Desc"),
      stat: t("productsPage.p1Stat"),
      statLabel: t("productsPage.p1StatLabel"),
      items: [t("productsPage.p1Item1"), t("productsPage.p1Item2"), t("productsPage.p1Item3"), t("productsPage.p1Item4")],
    },
    {
      id: "filing-intake-automation",
      icon: Workflow,
      title: t("productsPage.p2Title"),
      tagline: t("productsPage.p2Tagline"),
      description: t("productsPage.p2Desc"),
      stat: t("productsPage.p2Stat"),
      statLabel: t("productsPage.p2StatLabel"),
      items: [t("productsPage.p2Item1"), t("productsPage.p2Item2"), t("productsPage.p2Item3"), t("productsPage.p2Item4")],
    },
  ];

  const upcoming = {
    id: "quote-follow-up-agent",
    icon: Bot,
    title: t("productsPage.p3Title"),
    tagline: t("productsPage.p3Tagline"),
    description: t("productsPage.p3Desc"),
    cta: t("productsPage.p3Cta"),
  };

  const jumpLinks = [...products, upcoming];

  return (
    <div className="min-h-screen bg-cream">
      <SEO title={`${t("productsPage.title")} — Impera`} description={t("productsPage.subtitle")} path="/products" />
      <Navbar />

      <PageHero
        eyebrow={t("productsPage.eyebrow")}
        title={t("productsPage.title")}
        subtitle={t("productsPage.subtitle")}
      />

      {/* Jump-to bar */}
      <nav aria-label={t("productsPage.jumpTo")} className="bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-3">
          <span className="font-body text-sm text-muted-foreground">{t("productsPage.jumpTo")}</span>
          {jumpLinks.map((product) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className="font-body text-sm text-navy rounded-full border border-border px-4 py-1.5 hover:border-gold hover:text-gold transition-colors duration-300"
            >
              {product.title}
            </a>
          ))}
        </div>
      </nav>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {products.map((product, i) => (
            <FadeInSection key={product.id}>
              <article
                id={product.id}
                className={`scroll-mt-28 ${i > 0 ? "mt-12 md:mt-16 pt-12 md:pt-16 border-t border-border" : ""}`}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-body text-[11px] uppercase tracking-[0.15em] text-navy/70">
                  <Zap className="w-3 h-3 text-gold" aria-hidden="true" />
                  {t("productsPage.badgeLive")}
                </span>

                <div className="flex items-center gap-4 mt-5 mb-2">
                  <product.icon className="w-6 h-6 md:w-7 md:h-7 text-gold shrink-0" aria-hidden="true" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-navy leading-snug">{product.title}</h2>
                </div>
                <p className="font-display text-base md:text-lg italic text-muted-foreground mb-8">{product.tagline}</p>

                <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
                  <div>
                    <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
                      {product.description}
                    </p>

                    <div className="rounded-xl bg-navy-dark px-6 py-5">
                      <p className="font-display text-3xl md:text-4xl font-bold text-gold-gradient leading-none mb-2">
                        {product.stat}
                      </p>
                      <p className="font-body text-sm text-cream/70">{product.statLabel}</p>
                    </div>

                    <p className="font-body text-sm text-muted-foreground mt-4">{t("productsPage.pricingNote")}</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-background p-6 md:p-8">
                    <h3 className="font-display text-lg font-bold text-navy mb-5">{t("productsPage.whatsIncluded")}</h3>
                    <ul className="space-y-3.5">
                      {product.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" aria-hidden="true" />
                          <span className="font-body text-sm text-muted-foreground leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </FadeInSection>
          ))}

          {/* In-development product — dashed frame signals it isn't buyable yet */}
          <FadeInSection delay={150}>
            <article
              id={upcoming.id}
              className="scroll-mt-28 mt-12 md:mt-16 rounded-2xl border border-dashed border-navy/20 p-6 md:p-10"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-navy/5 px-3 py-1 font-body text-[11px] uppercase tracking-[0.15em] text-navy/70">
                <Clock className="w-3 h-3 text-gold" aria-hidden="true" />
                {t("productsPage.badgeDev")}
              </span>

              <div className="flex items-center gap-4 mt-5 mb-2">
                <upcoming.icon className="w-6 h-6 md:w-7 md:h-7 text-gold shrink-0" aria-hidden="true" />
                <h2 className="font-display text-2xl md:text-3xl font-bold text-navy leading-snug">{upcoming.title}</h2>
              </div>
              <p className="font-display text-base md:text-lg italic text-muted-foreground mb-6">{upcoming.tagline}</p>

              <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed mb-6 max-w-3xl">
                {upcoming.description}
              </p>

              <LocalizedLink
                to="/contact"
                className="inline-flex items-center gap-2 font-body text-sm font-semibold text-navy hover:text-gold transition-colors duration-300"
              >
                {upcoming.cta}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </LocalizedLink>
            </article>
          </FadeInSection>
        </div>
      </section>

      <section className="bg-navy-dark py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <FadeInSection>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cream mb-5">{t("productsPage.ctaTitle")}</h2>
            <p className="font-body text-sm md:text-base text-cream/70 leading-relaxed mb-10">{t("productsPage.ctaDesc")}</p>
            <LocalizedLink
              to="/our-services"
              className="inline-block px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
            >
              {t("productsPage.ctaButton")}
            </LocalizedLink>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
