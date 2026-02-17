import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Aurum Capital",
    category: "Brand Identity & Web",
    description:
      "Complete brand overhaul for a luxury investment firm. We redefined their visual identity and built a bespoke digital platform that reflects the sophistication of their clientele.",
    year: "2025",
  },
  {
    title: "Maison Noire",
    category: "Digital Marketing",
    description:
      "A 360° campaign for a haute couture fashion house spanning paid media, influencer partnerships, and editorial content that generated a 340% increase in brand engagement.",
    year: "2025",
  },
  {
    title: "Vertex Automotive",
    category: "Web Development",
    description:
      "An immersive digital showroom for a premium car brand featuring 3D configurators, cinematic transitions, and a performance-first architecture.",
    year: "2024",
  },
  {
    title: "Elysian Hotels",
    category: "Brand Identity",
    description:
      "Crafted a timeless brand identity for an ultra-luxury hotel chain, from monogram design to a comprehensive guest-facing visual system.",
    year: "2024",
  },
  {
    title: "Sterling & Cole",
    category: "Growth Strategy",
    description:
      "Developed a data-driven growth framework for a premier law firm, resulting in a 200% increase in qualified leads within six months.",
    year: "2024",
  },
  {
    title: "Obsidian Watches",
    category: "Web Design & Marketing",
    description:
      "Designed and launched an editorial e-commerce experience for a Swiss watchmaker, blending storytelling with seamless commerce.",
    year: "2023",
  },
];

const Portfolio = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-navy-gradient">
        <div className="container mx-auto px-6 text-center">
          <p className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6">
            Selected Work
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-cream leading-tight mb-8">
            Our <span className="text-gold-gradient">Portfolio</span>
          </h1>
          <p className="font-body text-lg text-gold-muted max-w-2xl mx-auto">
            A curated selection of projects where vision met execution. Each one a testament to the power of premium digital craft.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div
                key={project.title}
                className="group relative bg-navy p-10 flex flex-col justify-between min-h-[360px] hover:gold-glow transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-8">
                  <span className="font-display text-7xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors duration-500">
                    0{i + 1}
                  </span>
                  <span className="font-body text-xs tracking-wider text-gold-muted uppercase">
                    {project.year}
                  </span>
                </div>

                <div>
                  <p className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2">
                    {project.category}
                  </p>
                  <h3 className="font-display text-2xl md:text-3xl font-semibold text-cream mb-4 group-hover:text-gold-light transition-colors duration-300">
                    {project.title}
                  </h3>
                  <p className="font-body text-sm text-gold-muted leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-6 h-px bg-gold/20 group-hover:bg-gold/50 transition-colors duration-500 w-12 group-hover:w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-navy-gradient text-center">
        <div className="container mx-auto px-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cream mb-6">
            Your Project Could Be Next
          </h2>
          <p className="font-body text-lg text-gold-muted max-w-xl mx-auto mb-10">
            Let's create something that commands attention and delivers results.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-12 py-5 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Portfolio;
