import { Globe, TrendingUp, Users } from "lucide-react";
import FadeInSection from "./FadeInSection";

const differentiators = [
  {
    icon: Globe,
    title: "Multilingual by Default",
    headline: "Launch Across Europe — Simultaneously",
    points: [
      "7 native European languages in-house — Romanian, English, Dutch, French, Italian, Spanish, Portuguese",
      "Culturally adapted campaigns, not machine translations",
      "Enter new markets in weeks instead of months",
    ],
  },
  {
    icon: TrendingUp,
    title: "ROI-Obsessed Execution",
    headline: "Every Euro Tracked, Modeled & Optimized",
    points: [
      "Founded by a finance analyst who treats marketing budgets like investment portfolios",
      "AI-powered automation delivers results 3× faster than traditional agencies",
      "Transparent reporting — you always know exactly where your money goes",
    ],
  },
  {
    icon: Users,
    title: "Direct Access to Strategists",
    headline: "No Account Managers. No Junior Teams.",
    points: [
      "Work directly with Flavian (Founder), Inna (15-year veteran), and Aslan (SEO specialist)",
      "Strategic decisions made in hours, not weeks",
      "Senior-level thinking on every project, every time",
    ],
  },
];

const WhyImperaSection = () => {
  return (
    <section className="py-32 bg-navy-dark relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.03] rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            The Impera Difference
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">
            Why Scale-Ups Choose Impera
            <br />
            <span className="text-gold-gradient">Over Established Agencies</span>
          </h2>
          <p className="font-body text-gold-muted max-w-2xl mx-auto leading-relaxed">
            Big agencies give you processes. We give you partners — senior strategists who speak your language, obsess over your ROI, and move at your speed.
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {differentiators.map((item, i) => (
            <FadeInSection key={item.title} delay={i * 120}>
              <div className="h-full p-8 lg:p-10 border border-gold/10 bg-navy/40 hover:border-gold/25 transition-all duration-500 rounded-lg group">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/15 transition-colors">
                  <item.icon className="w-7 h-7 text-gold" />
                </div>

                {/* Eyebrow */}
                <p className="font-body text-[11px] tracking-[0.3em] text-gold uppercase mb-2">
                  {item.title}
                </p>

                {/* Headline */}
                <h3 className="font-display text-xl lg:text-2xl font-bold text-cream leading-snug mb-6">
                  {item.headline}
                </h3>

                {/* Points */}
                <ul className="space-y-4">
                  {item.points.map((point, j) => (
                    <li key={j} className="flex gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      <span className="font-body text-sm text-gold-muted leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyImperaSection;
