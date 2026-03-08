import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { supportedLanguages, type SupportedLanguage } from "@/i18n";

const flags: Record<SupportedLanguage, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  nl: "🇳🇱",
};

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = (i18n.language?.slice(0, 2) || "en") as SupportedLanguage;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setOpen(false);

    // Rebuild path with new language prefix
    const pathParts = location.pathname.split("/").filter(Boolean);
    const isLangPrefix = supportedLanguages.includes(pathParts[0] as SupportedLanguage);
    const cleanPath = isLangPrefix ? "/" + pathParts.slice(1).join("/") : location.pathname;
    const newPath = lang === "en" ? (cleanPath || "/") : `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
    navigate(newPath);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gold-muted hover:text-gold transition-colors"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span className="font-body text-xs tracking-wider uppercase">{currentLang}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-navy border border-navy-light/50 backdrop-blur-md shadow-lg min-w-[140px] z-50 animate-fade-in" role="menu" aria-label="Language options">
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              role="menuitem"
              aria-current={lang === currentLang ? "true" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 font-body text-sm transition-colors min-h-[44px] ${
                lang === currentLang
                  ? "text-gold bg-navy-dark/50"
                  : "text-cream/70 hover:text-gold hover:bg-navy-dark/30"
              }`}
            >
              <span className="text-base">{flags[lang]}</span>
              {t(`languageSwitcher.${lang}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
