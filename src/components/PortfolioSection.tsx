import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const caseStudies = [
  {
    industry: "Luxury Investment",
    category: "Brand Identity & Web",
    result: "340% increase in qualified leads",
  },
  {
    industry: "Haute Couture Fashion",
    category: "Digital Marketing",
    result: "520% social media growth in 6 months",
  },
  {
    industry: "Premium Automotive",
    category: "Web Development",
    result: "3.1x increase in online bookings",
  },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-32 bg-cream">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">
            Proven Results
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
            Case Studies
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {caseStudies.map((study, i) => (
            <div
              key={study.industry}
              className="group relative overflow-hidden bg-navy aspect-[3/4] flex flex-col justify-end p-8 cursor-pointer"
            >
              <span className="absolute top-6 right-6 font-display text-6xl font-bold text-gold/10 group-hover:text-gold/20 transition-colors duration-500">
                0{i + 1}
              </span>

              <div className="relative z-10">
                <p className="font-body text-xs tracking-[0.2em] text-gold uppercase mb-2">
                  {study.category}
                </p>
                <h3 className="font-display text-2xl font-semibold text-cream mb-3 group-hover:text-gold-light transition-colors duration-300">
                  {study.industry} Client
                </h3>
                <p className="font-display text-lg font-bold text-gold mb-1">
                  {study.result}
                </p>
                <div className="mt-4 h-px bg-gold/20 group-hover:bg-gold/50 transition-colors duration-500 w-12 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 font-body text-sm tracking-wider text-navy uppercase hover:text-gold transition-colors duration-300"
          >
            View All Case Studies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
