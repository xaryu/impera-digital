import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import FadeInSection from "@/components/FadeInSection";
import { Search, Target, Rocket, ArrowRight, CheckCircle2, Clock, FileText } from "lucide-react";

const phases = [
  {
    number: "01",
    title: "Imperial Audit",
    timeline: "Week 1–2",
    icon: Search,
    description:
      "We dissect your competitive landscape, model revenue opportunities, and expose every positioning gap holding you back.",
    deliverable: "Strategic roadmap with revenue projections",
    items: [
      "Competitive landscape analysis across all target markets",
      "Revenue opportunity modeling",
      "Current positioning gaps identified",
    ],
  },
  {
    number: "02",
    title: "Strategic Positioning",
    timeline: "Week 3–4",
    icon: Target,
    description:
      "We craft market-specific messaging localized per language and culture, build your brand architecture, and define your unique value proposition.",
    deliverable: "Positioning playbook + creative assets",
    items: [
      "Market-specific messaging (localized per language/culture)",
      "Brand architecture and visual identity",
      "Unique value proposition development",
    ],
  },
  {
    number: "03",
    title: "Digital Dominance",
    timeline: "Week 5–12",
    icon: Rocket,
    description:
      "We launch multi-channel campaigns, optimize every conversion point, deploy AI-powered automation, and run weekly optimization sprints.",
    deliverable: "Scaled campaigns + performance dashboard",
    items: [
      "Multi-channel campaign launch (Google, Meta, LinkedIn)",
      "Website conversion optimization",
      "AI-powered automation setup",
      "Weekly optimization sprints",
    ],
  },
];

const Methodology = () => {
  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO
        title="The Impera Framework — Command Your Market in 90 Days"
        description="Our battle-tested 90-day framework takes ambitious brands from local players to regional leaders through strategic auditing, positioning, and digital dominance."
        path="/methodology"
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy to-navy-dark" />
        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <FadeInSection>
            <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
              Our Methodology
            </p>
          </FadeInSection>
          <FadeInSection delay={150}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
              The Impera Framework
            </h1>
          </FadeInSection>
          <FadeInSection delay={300}>
            <p className="font-display text-xl md:text-2xl text-gold italic max-w-2xl mx-auto mb-8">
              Command Your Market in 90 Days
            </p>
          </FadeInSection>
          <FadeInSection delay={450}>
            <p className="font-body text-cream/70 max-w-xl mx-auto leading-relaxed">
              Our battle-tested process for taking ambitious brands from local players to regional leaders. This isn't theory — it's a proven system with measurable outcomes.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* Timeline visual connector */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-6">
          {/* 90-day bar */}
          <FadeInSection>
            <div className="relative max-w-4xl mx-auto mb-20">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-xs tracking-widest text-gold-muted uppercase">Day 1</span>
                <span className="font-body text-xs tracking-widest text-gold-muted uppercase">Day 90</span>
              </div>
              <div className="relative h-2 bg-navy-light/50 rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-gold/80 to-gold/60 rounded-full" />
                <div className="absolute inset-y-0 left-[18%] w-[15%] bg-gradient-to-r from-gold/60 to-gold/40 rounded-full" />
                <div className="absolute inset-y-0 left-[36%] w-[62%] bg-gradient-to-r from-gold/40 to-gold/80 rounded-full" />
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex items-center gap-1.5 text-cream/50">
                  <Clock className="w-3 h-3" />
                  <span className="font-body text-xs">Audit</span>
                </div>
                <div className="flex items-center gap-1.5 text-cream/50">
                  <Clock className="w-3 h-3" />
                  <span className="font-body text-xs">Position</span>
                </div>
                <div className="flex items-center gap-1.5 text-cream/50">
                  <Clock className="w-3 h-3" />
                  <span className="font-body text-xs">Dominate</span>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Phase cards */}
          <div className="space-y-16 md:space-y-24 max-w-5xl mx-auto">
            {phases.map((phase, i) => (
              <FadeInSection key={phase.number} delay={i * 150}>
                <div className="relative grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
                  {/* Left: Phase indicator */}
                  <div className="flex md:flex-col items-center md:items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gold/40 flex items-center justify-center bg-navy/60 backdrop-blur-sm">
                        <phase.icon className="w-7 h-7 md:w-8 md:h-8 text-gold" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gold text-navy-dark text-xs font-bold flex items-center justify-center font-body">
                        {phase.number}
                      </span>
                    </div>
                    <div>
                      <p className="font-body text-xs tracking-[0.3em] text-gold-muted uppercase">
                        Phase {phase.number}
                      </p>
                      <p className="font-body text-sm text-cream/50 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {phase.timeline}
                      </p>
                    </div>
                    {/* Vertical connector line (desktop only) */}
                    {i < phases.length - 1 && (
                      <div className="hidden md:block absolute left-10 top-24 w-px h-[calc(100%+3rem)] bg-gradient-to-b from-gold/30 to-transparent" />
                    )}
                  </div>

                  {/* Right: Content card */}
                  <div className="bg-navy/40 border border-navy-light/30 p-8 md:p-10 backdrop-blur-sm hover:border-gold/30 transition-colors duration-500">
                    <h2 className="font-display text-2xl md:text-3xl text-cream font-bold mb-4">
                      {phase.title}
                    </h2>
                    <p className="font-body text-cream/70 leading-relaxed mb-6">
                      {phase.description}
                    </p>

                    {/* Checklist */}
                    <ul className="space-y-3 mb-8">
                      {phase.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                          <span className="font-body text-sm text-cream/80">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Deliverable */}
                    <div className="flex items-center gap-3 bg-navy-dark/60 border border-gold/20 px-5 py-3">
                      <FileText className="w-4 h-4 text-gold flex-shrink-0" />
                      <div>
                        <span className="font-body text-[10px] tracking-[0.25em] text-gold-muted uppercase">
                          Deliverable
                        </span>
                        <p className="font-body text-sm text-gold font-medium">
                          {phase.deliverable}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 text-center">
          <FadeInSection>
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl text-cream font-bold mb-6">
                Ready to Command Your Market?
              </h2>
              <p className="font-body text-cream/60 mb-10 leading-relaxed">
                The Impera Framework has helped scale-ups across Europe multiply their digital revenue. Your 90-day transformation starts with a single conversation.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gold text-navy-dark font-body text-sm tracking-wider uppercase font-semibold hover:bg-gold-light transition-colors duration-300"
              >
                Start Your 90-Day Transformation
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Methodology;
