import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="py-12 bg-navy-dark border-t border-gold/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="font-display text-xl font-bold tracking-widest text-cream uppercase">
            Impera
          </Link>
          <div className="flex items-center gap-8">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="font-body text-xs tracking-wider text-gold-muted hover:text-gold transition-colors uppercase"
              >
                {link.label}
              </Link>
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
