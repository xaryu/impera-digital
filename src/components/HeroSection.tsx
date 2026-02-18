import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - dark navy gradient with geometric pattern */}
      <div className="absolute inset-0 bg-navy-gradient">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(30deg, hsl(var(--gold)) 12%, transparent 12.5%, transparent 87%, hsl(var(--gold)) 87.5%, hsl(var(--gold))),
              linear-gradient(150deg, hsl(var(--gold)) 12%, transparent 12.5%, transparent 87%, hsl(var(--gold)) 87.5%, hsl(var(--gold))),
              linear-gradient(30deg, hsl(var(--gold)) 12%, transparent 12.5%, transparent 87%, hsl(var(--gold)) 87.5%, hsl(var(--gold))),
              linear-gradient(150deg, hsl(var(--gold)) 12%, transparent 12.5%, transparent 87%, hsl(var(--gold)) 87.5%, hsl(var(--gold))),
              linear-gradient(60deg, hsl(var(--gold) / 0.5) 25%, transparent 25.5%, transparent 75%, hsl(var(--gold) / 0.5) 75%, hsl(var(--gold) / 0.5)),
              linear-gradient(60deg, hsl(var(--gold) / 0.5) 25%, transparent 25.5%, transparent 75%, hsl(var(--gold) / 0.5) 75%, hsl(var(--gold) / 0.5))
            `,
            backgroundSize: '80px 140px',
            backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <p
          className="font-body text-sm tracking-[0.4em] text-gold uppercase mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Digital Media Agency
        </p>
        <h1
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-tight mb-8 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          Command Your
          <br />
          <span className="text-gold-gradient">Digital Empire</span>
        </h1>
        <p
          className="font-body text-lg md:text-xl text-gold-muted max-w-2xl mx-auto mb-12 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          We craft premium digital experiences that elevate brands to positions of authority and distinction.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        >
          <Link
            to="/portfolio"
            className="px-10 py-4 bg-gold text-navy-dark font-body text-sm font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors duration-300"
          >
            View Our Work
          </Link>
          <Link
            to="/contact"
            className="px-10 py-4 border border-gold/40 text-cream font-body text-sm tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
          >
            Start a Project
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <span className="text-gold-muted text-xs tracking-widest uppercase font-body">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
