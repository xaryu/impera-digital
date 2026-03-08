import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { Award, Users, Target, Shield, Settings, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LeadershipSection from "@/components/LeadershipSection";
import AdminAuth from "@/components/AdminAuth";
import LocalizedLink from "@/components/LocalizedLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const valueIcons = [Shield, Target, Award, Users];
const valueKeys = ["authority", "precision", "excellence", "partnership"];

const About = () => {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
  };

  const stats = [
    { value: t("aboutPage.stat1"), label: t("aboutPage.stat1Label") },
    { value: t("aboutPage.stat2"), label: t("aboutPage.stat2Label") },
    { value: t("aboutPage.stat3"), label: t("aboutPage.stat3Label") },
    { value: t("aboutPage.stat4"), label: t("aboutPage.stat4Label") },
  ];

  return (
    <div className="min-h-screen">
      <SEO title={`${t("aboutPage.title")} ${t("aboutPage.titleHighlight")} — Impera`} description={t("aboutPage.intro").slice(0, 155)} path="/about" />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            {t("aboutPage.eyebrow")}
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            {t("aboutPage.title")} <span className="text-gold-gradient">{t("aboutPage.titleHighlight")}</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-3xl mx-auto">
            {t("aboutPage.intro")}
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
                {t("aboutPage.philosophyEyebrow")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-8 leading-tight">
                {t("aboutPage.philosophyTitle")}
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                {t("aboutPage.philosophyP1")}
              </p>
              <p className="font-body text-muted-foreground leading-relaxed mb-6">
                {t("aboutPage.philosophyP2")}
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                {t("aboutPage.philosophyP3")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-8 border border-border text-center hover:border-gold/30 hover:gold-glow transition-all duration-500 bg-background"
                >
                  <p className="font-display text-4xl font-bold text-gold mb-2">
                    {stat.value}
                  </p>
                  <p className="font-body text-xs tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-navy-gradient">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              {t("aboutPage.valuesEyebrow")}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream">
              {t("aboutPage.valuesTitle")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valueKeys.map((key, i) => {
              const Icon = valueIcons[i];
              return (
                <div
                  key={key}
                  className="p-8 border border-gold/15 hover:border-gold/30 transition-all duration-500"
                >
                  <Icon className="w-8 h-8 text-gold mb-6" />
                  <h3 className="font-display text-xl font-semibold text-cream mb-3">
                    {t(`aboutPage.${key}Title`)}
                  </h3>
                  <p className="font-body text-sm text-gold-muted leading-relaxed">
                    {t(`aboutPage.${key}Desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <LeadershipSection isAdmin={isAdmin} />

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center relative">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            {t("aboutPage.ctaTitle")}
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            {t("aboutPage.ctaDesc")}
          </p>
          <LocalizedLink
            to="/contact"
            className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            {t("aboutPage.ctaButton")}
          </LocalizedLink>
        </div>
        {/* Admin toggle */}
        <div className="absolute bottom-4 right-6">
          {isAdmin ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 font-body text-xs text-gold/40 hover:text-gold/80 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Exit Admin
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 font-body text-xs text-gold/20 hover:text-gold/60 transition-colors"
            >
              <Settings className="w-3 h-3" />
              Admin
            </button>
          )}
        </div>
      </section>

      {showAuthModal && (
        <AdminAuth
          onClose={() => setShowAuthModal(false)}
          onLoggedIn={() => setIsAdmin(true)}
        />
      )}

      <Footer />
    </div>
  );
};

export default About;
