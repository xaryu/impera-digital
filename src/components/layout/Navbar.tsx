import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ImperaLogo from "@/components/common/ImperaLogo";
import LocalizedLink from "@/components/layout/LocalizedLink";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import { signOutAdmin, useAdmin } from "@/hooks/use-admin";

const adminIconClass = "text-gold-muted/40 hover:text-gold transition-colors";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin } = useAdmin();

  const navLinks = [
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.ourServices"), href: "/our-services" },
    { label: t("nav.products"), href: "/products" },
    { label: t("nav.howWeWork"), href: "/methodology" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.careers"), href: "/careers" },
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
      <div className="container mx-auto flex items-center justify-between py-3 px-6">
        <LocalizedLink to="/" className="flex items-center">
          <ImperaLogo className="h-[45px] md:h-[50px] max-[480px]:h-[38px]" />
        </LocalizedLink>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
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
            className="ml-2 px-6 py-2.5 border border-gold/40 text-gold text-sm tracking-wider uppercase whitespace-nowrap hover:bg-gold/10 transition-all duration-300"
          >
            {t("nav.getInTouch")}
          </LocalizedLink>
          {isAdmin && (
            <div className="flex items-center gap-3 pl-4 border-l border-gold/15">
              <Link to="/admin" title="Admin dashboard" aria-label="Admin dashboard" className={adminIconClass}>
                <LayoutDashboard className="w-4 h-4" />
              </Link>
              <button onClick={signOutAdmin} title="Sign out" aria-label="Sign out of admin" className={adminIconClass}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-cream p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy/95 backdrop-blur-md border-t border-navy-light/50 px-6 py-6 animate-fade-in max-h-[80vh] overflow-y-auto">
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
            {isAdmin && (
              <div className="mt-4 pt-4 border-t border-gold/10 flex items-center justify-center gap-6 font-body text-xs tracking-wider uppercase">
                <Link to="/admin" onClick={() => setIsOpen(false)} className={`flex items-center gap-2 py-2 ${adminIconClass}`}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    signOutAdmin();
                  }}
                  className={`flex items-center gap-2 py-2 ${adminIconClass}`}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
