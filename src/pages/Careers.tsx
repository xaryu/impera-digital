import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import LocalizedLink from "@/components/LocalizedLink";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import FadeInSection from "@/components/FadeInSection";
import AdminAuth from "@/components/AdminAuth";
import JobEditor from "@/components/JobEditor";
import { ArrowRight, Hammer, Inbox, KeyRound, LogOut, Settings, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const CAREERS_EMAIL = "careers@impera-group.com";

const Careers = () => {
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: jobs = [] } = useQuery({
    queryKey: ["job-openings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_openings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const visibleJobs = isAdmin ? jobs : jobs.filter((j) => j.published);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast.success("Logged out");
  };

  const values = [
    { icon: KeyRound, title: t("careersPage.value1Title"), description: t("careersPage.value1Desc") },
    { icon: Users, title: t("careersPage.value2Title"), description: t("careersPage.value2Desc") },
    { icon: Hammer, title: t("careersPage.value3Title"), description: t("careersPage.value3Desc") },
    { icon: ShieldCheck, title: t("careersPage.value4Title"), description: t("careersPage.value4Desc") },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <SEO title={`${t("careersPage.title")} — Impera`} description={t("careersPage.subtitle")} path="/careers" />
      <Navbar />

      {/* Admin bar */}
      <div className="fixed bottom-6 right-6 z-40 flex gap-2">
        {isAdmin ? (
          <>
            <button onClick={() => setShowEditor(true)} className="flex items-center gap-2 px-4 py-2 bg-gold text-navy-dark font-body text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors">
              <Settings className="w-4 h-4" /> Manage Jobs
            </button>
            <button onClick={handleLogout} className="p-2 bg-navy border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={() => setShowAuth(true)} className="px-4 py-2 border border-navy/20 text-navy font-body text-xs tracking-wider uppercase hover:bg-navy/5 transition-colors opacity-30 hover:opacity-100">
            Admin
          </button>
        )}
      </div>

      {showAuth && <AdminAuth onClose={() => setShowAuth(false)} onLoggedIn={() => setIsAdmin(true)} />}
      {showEditor && <JobEditor onClose={() => setShowEditor(false)} />}

      <PageHero
        eyebrow={t("careersPage.eyebrow")}
        title={t("careersPage.title")}
        subtitle={t("careersPage.subtitle")}
      />

      {/* Why people work here */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          <FadeInSection className="text-center mb-10 md:mb-14">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy">{t("careersPage.whyTitle")}</h2>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <FadeInSection key={value.title} delay={i * 120}>
                <div className="h-full rounded-2xl border border-border bg-background p-6 text-center hover:border-gold/40 transition-colors duration-500">
                  <value.icon className="w-6 h-6 text-gold mx-auto mb-4" aria-hidden="true" />
                  <h3 className="font-display text-lg font-bold text-navy mb-3">{value.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>

          {/* Team note */}
          <FadeInSection delay={480}>
            <div className="mt-8 rounded-2xl border border-border bg-background px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center">
              <Users className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
              <p className="font-body text-sm text-muted-foreground">{t("careersPage.teamNote")}</p>
              <LocalizedLink
                to="/about"
                className="inline-flex items-center gap-2 shrink-0 rounded-full border border-border px-4 py-1.5 font-body text-sm text-navy hover:border-gold hover:text-gold transition-colors duration-300"
              >
                {t("careersPage.meetTheTeam")}
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </LocalizedLink>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Open roles */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <FadeInSection className="text-center mb-10 md:mb-12">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-navy">{t("careersPage.openRolesTitle")}</h2>
          </FadeInSection>

          <FadeInSection delay={150}>
            {visibleJobs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background p-8 md:p-12 text-center">
                <Inbox className="w-7 h-7 text-gold mx-auto mb-5" aria-hidden="true" />
                <h3 className="font-display text-lg md:text-xl font-bold text-navy mb-4">{t("careersPage.noPositions")}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
                  {t("careersPage.noPositionsDesc")}
                </p>
                <LocalizedLink
                  to="/contact"
                  className="inline-block px-8 py-3.5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
                >
                  {t("careersPage.introduceYourself")}
                </LocalizedLink>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleJobs.map((role) => (
                  <LocalizedLink
                    key={role.id}
                    to={`/careers/${role.slug}`}
                    className="group block rounded-2xl border border-border bg-background p-6 md:p-8 hover:border-gold/40 transition-colors duration-500"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-display text-lg md:text-xl font-bold text-navy group-hover:text-gold transition-colors">
                            {role.title}
                          </h3>
                          {!role.published && (
                            <span className="font-body text-[11px] border border-border text-muted-foreground px-2 py-0.5 uppercase tracking-wider">
                              {t("blogPage.draft")}
                            </span>
                          )}
                        </div>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{role.short_description}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0">
                        <span className="font-body text-xs tracking-wider text-muted-foreground uppercase">{role.department}</span>
                        <span className="text-border" aria-hidden="true">|</span>
                        <span className="font-body text-xs tracking-wider text-muted-foreground uppercase">{role.location}</span>
                        <span className="font-body text-sm text-gold tracking-wider uppercase md:ml-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {t("careersPage.apply")}
                        </span>
                      </div>
                    </div>
                  </LocalizedLink>
                ))}
              </div>
            )}
          </FadeInSection>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-navy-dark py-16 md:py-24">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <FadeInSection>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cream mb-5">{t("careersPage.ctaTitle")}</h2>
            <p className="font-body text-sm md:text-base text-cream/70 leading-relaxed mb-10">{t("careersPage.ctaDesc")}</p>
            <a
              href={`mailto:${CAREERS_EMAIL}`}
              className="inline-block px-10 py-4 border border-gold/40 text-gold font-body text-sm tracking-wider hover:bg-gold/10 transition-colors duration-300"
            >
              {CAREERS_EMAIL}
            </a>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
