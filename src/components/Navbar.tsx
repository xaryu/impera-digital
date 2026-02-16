import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/80 backdrop-blur-md border-b border-gold/10">
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <a href="#" className="font-display text-2xl font-bold tracking-widest text-cream uppercase">
          Impera
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm tracking-wider text-gold-muted hover:text-gold transition-colors duration-300 uppercase"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="ml-4 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
          >
            Get in Touch
          </a>
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
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-body text-sm tracking-wider text-gold-muted hover:text-gold transition-colors uppercase"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase text-center hover:bg-gold/10 transition-all"
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
