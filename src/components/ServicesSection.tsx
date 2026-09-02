import { ComponentType, CSSProperties } from "react";
import { Megaphone, Palette, TrendingUp, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "./FadeInSection";
import { useInView } from "@/hooks/useInView";

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    { icon: Palette, title: t("services.brandIdentity"), description: t("services.brandIdentityDesc") },
    { icon: Globe, title: t("services.webDesign"), description: t("services.webDesignDesc") },
    { icon: Megaphone, title: t("services.digitalMarketing"), description: t("services.digitalMarketingDesc") },
    { icon: TrendingUp, title: t("services.growthStrategy"), description: t("services.growthStrategyDesc") },
  ];

  return (
    <section id="services" className="py-44 bg-cream">
      <div className="container mx-auto px-6">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("services.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">{t("services.title")}</h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  service: { icon: ComponentType<{ className?: string }>; title: string; description: string };
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  // threshold 0.6 = card must be 60% on screen before it counts as "in
  // view" — the default (0.15) was firing the instant a sliver peeked up
  // from the bottom edge, well before it was actually readable. The small
  // rootMargin step still biases trigger order card-to-card without being
  // demanding enough to strand the last card on a short section.
  const { ref, isInView, reduced } = useInView<HTMLDivElement>({
    threshold: 0.8,
    rootMargin: `0px 0px -${30 + index * 45}px 0px`,
  });

  // Material's "deceleration" easing (cubic-bezier(0,0,0.2,1)) — entrances
  // start at full speed and settle, never overshoot or bounce. The
  // transitionDelay is what carries the one-by-one read — even when all
  // four cards satisfy the scroll offset in the same instant (refresh,
  // fast scroll), they still cascade in rather than popping together.
  const style: CSSProperties = reduced
    ? {}
    : {
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
        transition: "opacity 650ms cubic-bezier(0,0,0.2,1), transform 650ms cubic-bezier(0,0,0.2,1)",
        transitionDelay: `${index * 350}ms`,
      }; 

  return (
    // outer div owns only the reveal transform, kept off the inner card so
    // it never fights the inner card's own hover:scale-[1.02]
    <div ref={ref} style={style}>
      <div className="group relative h-full p-8 bg-background border border-border hover:border-gold/30 transition-all duration-500 hover:gold-glow hover:scale-[1.02] hover:shadow-lg">
        <service.icon className="w-8 h-8 text-gold mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
        <h3 className="font-display text-xl font-semibold text-navy mb-3">{service.title}</h3>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
      </div>
    </div>
  );
};

export default ServicesSection;
