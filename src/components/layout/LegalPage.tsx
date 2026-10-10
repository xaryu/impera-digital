import { Trans, useTranslation } from "react-i18next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { company, companyAddressLine } from "@/config/company";

type LegalDocument = "privacy" | "terms";

// Shape of each entry in `<document>.sections` in src/i18n/locales/*/legal.json.
type LegalSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  afterList?: string[];
};

// Tags the legal texts may use, e.g. "<b>Access</b> — Request a copy…".
const textComponents = {
  b: <span className="text-cream/80" />,
  calendlyPolicy: (
    <a
      href="https://calendly.com/privacy"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold hover:text-gold-light transition-colors underline"
    />
  ),
};

const LegalText = ({ i18nKey }: { i18nKey: string }) => <Trans i18nKey={i18nKey} components={textComponents} />;

const ContactCard = () => (
  <div className="mt-4 border border-gold/10 p-6 bg-navy/30">
    <p className="text-cream">{company.name}</p>
    <p className="text-cream/70 mt-1">
      {companyAddressLine}, {company.address.country}
    </p>
    <p className="mt-2">
      <a href={`mailto:${company.email}`} className="text-gold hover:text-gold-light transition-colors">
        {company.email}
      </a>
    </p>
  </div>
);

// Renders the Privacy Policy or Terms of Service from legal.json. Every section
// is a title followed by optional paragraphs, a bullet list, and text after the
// list; the company contact card closes the last section.
const LegalPage = ({ doc, path }: { doc: LegalDocument; path: string }) => {
  const { t } = useTranslation();
  const sections = t(`${doc}.sections`, { returnObjects: true }) as LegalSection[];

  return (
    <div className="min-h-screen bg-navy-dark">
      <SEO title={`${t(`${doc}.title`)} — Impera`} description={t(`${doc}.title`)} path={path} />
      <Navbar />

      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <p className="font-body text-sm tracking-[0.3em] text-gold uppercase mb-4">{t(`${doc}.legal`)}</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cream mb-12">{t(`${doc}.title`)}</h1>
          <p className="font-body text-xs text-gold-muted mb-12">{t(`${doc}.lastUpdated`)}</p>

          <div className="space-y-10 font-body text-sm text-cream/80 leading-relaxed">
            {sections.map((section, i) => {
              const key = `${doc}.sections.${i}`;
              return (
                <div key={key}>
                  <h2 className="font-display text-xl font-bold text-cream mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.paragraphs?.map((_, j) => (
                      <p key={j}>
                        <LegalText i18nKey={`${key}.paragraphs.${j}`} />
                      </p>
                    ))}
                    {section.list && (
                      <ul className="list-disc list-inside space-y-2 text-cream/70">
                        {section.list.map((_, j) => (
                          <li key={j}>
                            <LegalText i18nKey={`${key}.list.${j}`} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.afterList?.map((_, j) => (
                      <p key={j}>
                        <LegalText i18nKey={`${key}.afterList.${j}`} />
                      </p>
                    ))}
                  </div>
                  {i === sections.length - 1 && <ContactCard />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalPage;
