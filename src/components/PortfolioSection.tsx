const projects = [
  {
    title: "Aurum Capital",
    category: "Brand Identity & Web",
    description: "Complete brand overhaul for a luxury investment firm.",
  },
  {
    title: "Maison Noire",
    category: "Digital Marketing",
    description: "360° campaign for a haute couture fashion house.",
  },
  {
    title: "Vertex Automotive",
    category: "Web Development",
    description: "Immersive digital showroom for a premium car brand.",
  },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-32 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Selected Work
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
            Portfolio
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <div
              key={project.title}
              className="group relative overflow-hidden bg-navy aspect-[3/4] flex flex-col justify-end p-8 cursor-pointer"
            >
              {/* Number overlay */}
              <span className="absolute top-6 right-6 font-display text-6xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors duration-500">
                0{i + 1}
              </span>

              <div className="relative z-10">
                <p className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2">
                  {project.category}
                </p>
                <h3 className="font-display text-2xl font-semibold text-cream mb-3 group-hover:text-gold-light transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="font-body text-sm text-gold-muted">
                  {project.description}
                </p>
                <div className="mt-4 h-px bg-gold/20 group-hover:bg-gold/50 transition-colors duration-500 w-12 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
