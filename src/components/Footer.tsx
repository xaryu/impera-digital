const Footer = () => {
  return (
    <footer className="py-12 bg-navy-dark border-t border-gold/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#" className="font-display text-xl font-bold tracking-widest text-cream uppercase">
            Impera
          </a>
          <div className="flex items-center gap-8">
            {["Services", "Portfolio", "About", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="font-body text-xs tracking-wider text-gold-muted hover:text-gold transition-colors uppercase"
              >
                {link}
              </a>
            ))}
          </div>
          <p className="font-body text-xs text-gold-muted/60">
            © 2026 Impera. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
