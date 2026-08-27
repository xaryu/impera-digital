import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImperaLogo from "@/components/ImperaLogo";
import LocalizedLink from "@/components/LocalizedLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.howWeWork"), href: "/methodology" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.about"), href: "/about" },
  ];

  // Check if path matches (strip language prefix)
  const isActive = (href: string) => {
    const parts = location.pathname.split("/").filter(Boolean);
    const cleanPath = ["en", "fr", "nl"].includes(parts[0]) ? "/" + parts.slice(1).join("/") : location.pathname;
    return cleanPath === href;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-dark/90 backdrop-blur-md border-b border-navy-light/50" aria-label="Main navigation">
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <LocalizedLink to="/" className="flex items-center">
           <ImperaLogo className="h-[45px] md:h-[50px] max-[480px]:h-[38px]" />
        </LocalizedLink>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <LocalizedLink
              key={link.href}
              to={link.href}
              className={`font-body text-sm tracking-wider uppercase transition-colors duration-300 ${
                isActive(link.href)
                  ? "text-gold"
                  : "text-gold-muted hover:text-gold"
              }`}
            >
              {link.label}
            </LocalizedLink>
          ))}
          <LanguageSwitcher />
          <LocalizedLink
            to="/contact"
            className="ml-4 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase hover:bg-gold/10 transition-all duration-300"
          >
            {t("nav.getInTouch")}
          </LocalizedLink>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-cream p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-navy/95 backdrop-blur-md border-t border-navy-light/50 px-6 py-6 animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <LocalizedLink
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-body text-sm tracking-wider uppercase transition-colors py-3 px-2 min-h-[44px] flex items-center ${
                  isActive(link.href)
                    ? "text-gold"
                    : "text-gold-muted hover:text-gold"
                }`}
              >
                {link.label}
              </LocalizedLink>
            ))}
            <div className="py-3 px-2">
              <LanguageSwitcher />
            </div>
            <LocalizedLink
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="mt-2 px-6 py-3.5 min-h-[44px] border border-gold/40 text-gold text-sm tracking-wider uppercase text-center hover:bg-gold/10 transition-all flex items-center justify-center"
            >
              {t("nav.getInTouch")}
            </LocalizedLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
