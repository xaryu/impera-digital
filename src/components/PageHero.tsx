import FadeInSection from "./FadeInSection";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

/** Shared navy hero for standalone content pages — eyebrow, title and subtitle fade in in sequence. */
const PageHero = ({ eyebrow, title, subtitle }: PageHeroProps) => (
  <section className="relative bg-navy-dark pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] max-w-full h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none" />
    <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
      <FadeInSection>
        <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{eyebrow}</p>
      </FadeInSection>
      <FadeInSection delay={150}>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-cream leading-tight mb-6">{title}</h1>
      </FadeInSection>
      <FadeInSection delay={300}>
        <p className="font-body text-cream/70 leading-relaxed">{subtitle}</p>
      </FadeInSection>
    </div>
  </section>
);

export default PageHero;
