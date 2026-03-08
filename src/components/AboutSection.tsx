import FadeInSection from "./FadeInSection";

const stats = [
  { value: "10+", label: "Years Combined Freelance Experience" },
  { value: "3", label: "Specialists United Under One Vision" },
  { value: "2025", label: "Founded — Modern Agency, Veteran Execution" },
  { value: "7", label: "European Languages Served" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-navy-gradient">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeInSection>
            <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
              Our Philosophy
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-8 leading-tight">
              Where Vision
              <br />
              Meets <span className="text-gold-gradient">Authority</span>
            </h2>
            <p className="font-body text-gold-muted leading-relaxed mb-6">
              At Impera, we believe that true digital excellence is not merely about aesthetics — it is about commanding presence. Every pixel, every interaction, every strategy is designed to establish your brand as the undeniable leader in its space.
            </p>
            <p className="font-body text-gold-muted leading-relaxed">
              Our name, derived from the Latin <em className="text-gold">imperare</em> — to command — reflects our commitment to creating digital experiences that don't just compete, but reign.
            </p>
          </FadeInSection>

          <FadeInSection delay={150}>
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <FadeInSection key={stat.label} delay={200 + i * 80}>
                  <div className="p-8 border border-gold/15 text-center hover:border-gold/30 hover:scale-[1.03] transition-all duration-500">
                    <p className="font-display text-4xl font-bold text-gold mb-2">
                      {stat.value}
                    </p>
                    <p className="font-body text-xs tracking-wider text-gold-muted uppercase">
                      {stat.label}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
