import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import imperaLogo from "@/assets/impera-logo.png";
const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <Link to="/" className="flex items-center">
          <img src={imperaLogo} alt="Impera" className="h-10 brightness-0 invert" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-body text-sm tracking-wider uppercase transition-colors duration-300 ${
                location.pathname === link.href
                  ? "text-gold"
                  : "text-gold-muted hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="ml-4 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-cream"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy-dark/95 backdrop-blur-md border-t border-gold/10 px-6 py-8 animate-fade-in">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-body text-sm tracking-wider uppercase transition-colors ${
                  location.pathname === link.href
                    ? "text-gold"
                    : "text-gold-muted hover:text-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase text-center hover:bg-gold/10 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
