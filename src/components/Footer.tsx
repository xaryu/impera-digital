import { Link } from "react-router-dom";
import { Mail, MapPin, Clock, Instagram, Linkedin } from "lucide-react";
import ImperaLogo from "@/components/ImperaLogo";

const serviceLinks = [
  { label: "Brand Strategy", href: "/services" },
  { label: "Digital Marketing", href: "/services" },
  { label: "Web Development", href: "/services" },
  { label: "Content Creation", href: "/services" },
  { label: "Performance Marketing", href: "/services" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="bg-navy-dark border-t border-gold/10">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-5">
            <Link to="/">
              <ImperaLogo className="h-16" />
            </Link>
            <p className="font-display text-sm italic text-gold-muted">
              Command Your Digital Presence
            </p>
            <p className="font-body text-sm text-cream/70 leading-relaxed">
              Impera is a premium digital media agency crafting authoritative brand experiences. We partner with ambitious businesses to dominate their markets.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[
                { icon: Linkedin, href: "#" },
                { icon: Instagram, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-gold/20 flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold/50 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-cream/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="font-body text-sm text-cream/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-gold mt-0.5 shrink-0" />
                <a href="mailto:contact@impera-group.com" className="font-body text-sm text-cream/60 hover:text-gold transition-colors">
                  contact@impera-group.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="font-body text-sm text-cream/60">
                  Justus Lipsiusstraat 16, 3000, Leuven
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="font-body text-sm text-cream/60">
                  Mon – Fri: 9:00 – 18:00
                </span>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-8 inline-block px-6 py-3 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:bg-accent/90 transition-colors"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/10">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream/40">
            © 2026 Impera. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="font-body text-xs text-cream/40 hover:text-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="font-body text-xs text-cream/40 hover:text-gold transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
