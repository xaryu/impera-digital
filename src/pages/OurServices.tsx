import { Bot, Globe, Megaphone, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeInSection from "@/components/FadeInSection";
import LocalizedLink from "@/components/LocalizedLink";

const OurServices = () => {
  const { t } = useTranslation();

  const disciplines = [
    {
      icon: Bot,
      title: t("ourServicesPage.aiTitle"),
      description: t("ourServicesPage.aiDesc"),
      items: [t("ourServicesPage.aiItem1"), t("ourServicesPage.aiItem2"), t("ourServicesPage.aiItem3"), t("ourServicesPage.aiItem4")],
    },
    {
      icon: Globe,
      title: t("ourServicesPage.webTitle"),
      description: t("ourServicesPage.webDesc"),
      items: [t("ourServicesPage.webItem1"), t("ourServicesPage.webItem2"), t("ourServicesPage.webItem3"), t("ourServicesPage.webItem4")],
    },
    {
      icon: Megaphone,
      title: t("ourServicesPage.marketingTitle"),
      description: t("ourServicesPage.marketingDesc"),
      items: [
        t("ourServicesPage.marketingItem1"),
        t("ourServicesPage.marketingItem2"),
        t("ourServicesPage.marketingItem3"),
        t("ourServicesPage.marketingItem4"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO
        title={`${t("ourServicesPage.title")} — Impera`}
        description={t("ourServicesPage.subtitle")}
        path="/our-services"
      />
      <Navbar />

      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
          <FadeInSection>
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("ourServicesPage.eyebrow")}</p>
          </FadeInSection>
          <FadeInSection delay={150}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">{t("ourServicesPage.title")}</h1>
          </FadeInSection>
          <FadeInSection delay={300}>
            <p className="font-body text-cream/70 leading-relaxed">{t("ourServicesPage.subtitle")}</p>
          </FadeInSection>
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="space-y-6 md:space-y-8">
            {disciplines.map((discipline, i) => (
              <FadeInSection key={discipline.title} delay={i * 150}>
                <div className="rounded-2xl border border-gold/10 bg-navy/40 p-6 md:p-10 hover:border-gold/25 transition-colors duration-500">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <discipline.icon className="w-5 h-5 md:w-6 md:h-6 text-gold" aria-hidden="true" />
                    </div>
                    <h2 className="font-display text-lg md:text-2xl font-bold text-cream leading-snug">{discipline.title}</h2>
                  </div>

                  <p className="font-body text-sm md:text-base text-cream/70 leading-relaxed mb-6">{discipline.description}</p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    {discipline.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 shrink-0" aria-hidden="true" />
                        <span className="font-body text-sm text-cream/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeInSection>
            ))}
          </div>

          <FadeInSection delay={disciplines.length * 150} className="text-center mt-14 md:mt-16">
            <LocalizedLink
              to="/contact"
              className="inline-block px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
            >
              {t("ourServicesPage.cta")}
            </LocalizedLink>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default OurServices;
