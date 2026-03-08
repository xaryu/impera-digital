import FadeInSection from "./FadeInSection";
import CalendlyDialog from "./CalendlyDialog";

const CTASection = () => {
  return (
    <section id="contact" className="py-32 bg-navy-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <FadeInSection>
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Let&apos;s Create Together
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-cream mb-8 leading-tight">
            Ready to Command
            <br />
            Your Market?
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-12">
            Every empire begins with a single decision. Let's discuss how Impera can elevate your brand to its rightful position.
          </p>
          <CalendlyDialog>
            <button className="inline-block px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase btn-hover hover:bg-gold-light">
              Book a Free Call
            </button>
          </CalendlyDialog>
        </FadeInSection>
      </div>
    </section>
  );
};

export default CTASection;
