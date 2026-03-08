import { Megaphone, Palette, TrendingUp, Globe } from "lucide-react";
import FadeInSection from "./FadeInSection";

const services = [
  {
    icon: Palette,
    title: "Brand Identity",
    description: "Crafting visual identities that command attention and communicate prestige at every touchpoint.",
  },
  {
    icon: Globe,
    title: "Web Design & Development",
    description: "Bespoke digital experiences engineered for performance, elegance, and lasting impression.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Strategic campaigns that position your brand before the audiences that matter most.",
  },
  {
    icon: TrendingUp,
    title: "Growth Strategy",
    description: "Data-driven frameworks that transform market presence into measurable dominance.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-32 bg-cream">
      <div className="container mx-auto px-6">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            What We Do
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
            Services of Distinction
          </h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <FadeInSection key={service.title} delay={i * 100}>
              <div className="group p-8 bg-background border border-border hover:border-gold/30 transition-all duration-500 hover:gold-glow hover:scale-[1.02] hover:shadow-lg">
                <service.icon className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-display text-xl font-semibold text-navy mb-3">
                  {service.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
