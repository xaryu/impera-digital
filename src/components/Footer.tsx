import { useTranslation } from "react-i18next";
import { Mail, MapPin, Clock, Instagram, Linkedin } from "lucide-react";
import ImperaLogo from "@/components/ImperaLogo";
import LocalizedLink from "@/components/LocalizedLink";

const Footer = () => {
  const { t } = useTranslation();

  const serviceLinks = [
    { label: t("footer.brandStrategy"), href: "/services" },
    { label: t("footer.digitalMarketing"), href: "/services" },
    { label: t("footer.webDevelopment"), href: "/services" },
    { label: t("footer.contentCreation"), href: "/services" },
    { label: t("footer.performanceMarketing"), href: "/services" },
  ];

  const companyLinks = [
    { label: t("footer.aboutUs"), href: "/about" },
    { label: t("footer.blog"), href: "/blog" },
    { label: t("footer.careers"), href: "/careers" },
    { label: t("footer.contact"), href: "/contact" },
  ];

  return (
    <footer className="bg-navy-dark border-t border-navy-light/30" role="contentinfo">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="flex flex-col items-center md:items-start space-y-5">
            <LocalizedLink to="/" className="inline-block">
              <ImperaLogo className="h-[65px]" />
            </LocalizedLink>
            <p className="font-display text-sm italic text-gold-muted text-center md:text-left">{t("footer.tagline")}</p>
            <p className="font-body text-sm text-cream/70 leading-relaxed text-center md:text-left">{t("footer.description")}</p>
            <div className="flex items-center gap-4 pt-2 justify-center md:justify-start">
              {[{ icon: Linkedin, href: "#" }, { icon: Instagram, href: "#" }].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" aria-label={Icon === Linkedin ? "LinkedIn" : "Instagram"} className="w-9 h-9 rounded-full border border-navy-light flex items-center justify-center text-gold-muted hover:text-gold hover:border-gold/50 transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">{t("footer.servicesTitle")}</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <LocalizedLink to={link.href} className="font-body text-sm text-cream/60 hover:text-gold transition-colors">{link.label}</LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">{t("footer.companyTitle")}</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <LocalizedLink to={link.href} className="font-body text-sm text-cream/60 hover:text-gold transition-colors">{link.label}</LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold tracking-widest text-cream uppercase mb-6">{t("footer.contactTitle")}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-gold mt-0.5 shrink-0" />
                <a href="mailto:contact@impera-group.com" className="font-body text-sm text-cream/60 hover:text-gold transition-colors">contact@impera-group.com</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="font-body text-sm text-cream/60">Justus Lipsiusstraat 16, 3000, Leuven</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="font-body text-sm text-cream/60">{t("footer.monFri")}</span>
              </li>
            </ul>
            <LocalizedLink to="/contact" className="mt-8 inline-block px-6 py-3 bg-accent text-accent-foreground font-body text-sm font-semibold tracking-wider uppercase hover:bg-accent/90 transition-colors">
              {t("footer.startYourProject")}
            </LocalizedLink>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-light/30">
        <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-cream/40">{t("footer.rights")}</p>
          <div className="flex items-center gap-6">
            <LocalizedLink to="/privacy" className="font-body text-xs text-cream/40 hover:text-gold transition-colors">{t("footer.privacyPolicy")}</LocalizedLink>
            <LocalizedLink to="/terms" className="font-body text-xs text-cream/40 hover:text-gold transition-colors">{t("footer.termsOfService")}</LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
