import { useEffect } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supportedLanguages, type SupportedLanguage } from "@/i18n";

const LanguageLayout = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const resolved = supportedLanguages.includes(lang as SupportedLanguage)
      ? (lang as SupportedLanguage)
      : "en";
    if (i18n.language !== resolved) {
      i18n.changeLanguage(resolved);
    }
  }, [lang, i18n]);

  return <Outlet />;
};

export default LanguageLayout;
