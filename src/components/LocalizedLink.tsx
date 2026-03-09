import { Link as RouterLink, type LinkProps, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages, type SupportedLanguage } from "@/i18n";
import { useCallback } from "react";

/**
 * A language-aware Link that automatically prefixes the current language.
 * English links have no prefix. French -> /fr/..., Dutch -> /nl/...
 * Scrolls to top of page on navigation.
 */
const LocalizedLink = ({ to, onClick, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLanguage;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        window.scrollTo({ top: 0, left: 0 });
      }
    },
    [onClick]
  );

  if (typeof to === "string" && to.startsWith("/")) {
    const prefixed = lang === "en" ? to : `/${lang}${to === "/" ? "" : to}`;
    return <RouterLink to={prefixed} onClick={handleClick} {...props} />;
  }

  return <RouterLink to={to} onClick={handleClick} {...props} />;
};

export default LocalizedLink;
