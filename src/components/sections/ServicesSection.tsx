import { ComponentType, CSSProperties } from "react";
import { History, Hourglass, Layers, PhoneMissed, Unplug, UserX } from "lucide-react";
import { useTranslation } from "react-i18next";
import FadeInSection from "@/components/common/FadeInSection";
import { useInView } from "@/hooks/useInView";

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    { icon: Hourglass, title: t("services.seniorTime"), description: t("services.seniorTimeDesc") },
    { icon: Unplug, title: t("services.disconnectedSystems"), description: t("services.disconnectedSystemsDesc") },
    { icon: History, title: t("services.lateDecisions"), description: t("services.lateDecisionsDesc") },
    { icon: Layers, title: t("services.growingMess"), description: t("services.growingMessDesc") },
    { icon: PhoneMissed, title: t("services.coldLeads"), description: t("services.coldLeadsDesc") },
    { icon: UserX, title: t("services.keyPerson"), description: t("services.keyPersonDesc") },
  ];

  return (
    <section id="services" className="py-16 md:py-44 bg-cream">
      <div className="container mx-auto px-6">
        <FadeInSection className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t("services.eyebrow")}</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">{t("services.title")}</h2>
        </FadeInSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
  // from the bottom edge, well before it was actually readable. The
  // rootMargin is the same for every card: a margin that grows per card
  // shrinks the viewport enough to strand the last ones on short screens.
  const { ref, isInView, reduced } = useInView<HTMLDivElement>({
    threshold: 0.6,
    rootMargin: "0px 0px -30px 0px",
  });

  // Material's "deceleration" easing (cubic-bezier(0,0,0.2,1)) — entrances
  // start at full speed and settle, never overshoot or bounce. The delay
  // follows the card's column, so a row cascades left to right whatever
  // the card count, and one-column mobile has no delay at all. The column
  // depends on the breakpoint, hence the CSS variables: --reveal-delay is
  // resolved by the classes below.
  const style = (
    reduced
      ? {}
      : {
          "--col-md": index % 2,
          "--col-lg": index % 3,
          opacity: isInView ? 1 : 0,
          transform: isInView ? "translateY(0) scale(1)" : "translateY(20px) scale(0.98)",
          transition: "opacity 850ms cubic-bezier(0,0,0.2,1), transform 850ms cubic-bezier(0,0,0.2,1)",
          transitionDelay: "var(--reveal-delay)",
        }
  ) as CSSProperties;

  return (
    // outer div owns only the reveal transform, kept off the inner card so
    // it never fights the inner card's own hover:scale-[1.02]
    <div
      ref={ref}
      style={style}
      className="[--reveal-delay:0ms] md:[--reveal-delay:calc(var(--col-md)*250ms)] lg:[--reveal-delay:calc(var(--col-lg)*250ms)]"
    >
      <div className="group relative h-full p-8 bg-background border border-border hover:border-gold/30 transition-all duration-500 hover:gold-glow hover:scale-[1.02] hover:shadow-lg">
        <div className="flex flex-row items-center gap-4 mb-4 sm:flex-col sm:items-start sm:gap-0 sm:mb-0">
          <service.icon className="w-8 h-8 text-gold shrink-0 sm:mb-6 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
          <h3 className="font-display text-xl font-semibold text-navy sm:mb-3">{service.title}</h3>
        </div>
        <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.description}</p>
      </div>
    </div>
  );
};

export default ServicesSection;
