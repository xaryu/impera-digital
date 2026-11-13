import { Link as RouterLink, type LinkProps } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SupportedLanguage } from "@/i18n";

/**
 * A language-aware Link that automatically prefixes the current language.
 * English links have no prefix. French -> /fr/..., Dutch -> /nl/...
 * Scrolling after navigation (top of page, or the #anchor) is handled for every link by
 * `ScrollOnNavigate` in src/hooks/use-scroll-on-navigate.ts.
 */
const LocalizedLink = ({ to, ...props }: LinkProps) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) || "en") as SupportedLanguage;

  if (typeof to === "string" && to.startsWith("/")) {
    const prefixed = lang === "en" ? to : `/${lang}${to === "/" ? "" : to}`;
    return <RouterLink to={prefixed} {...props} />;
  }

  return <RouterLink to={to} {...props} />;
};

export default LocalizedLink;
