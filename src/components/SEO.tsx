import { Helmet } from "react-helmet-async";

const SITE_URL = "https://impera-digital.lovable.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_NAME = "Impera";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Impera",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "Premium digital media agency crafting luxury brand experiences that command authority and distinction.",
  email: "contact@impera-group.com",
  telephone: "+32 492 20 23 77",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Justus Lipsiusstraat 16",
    addressLocality: "Leuven",
    postalCode: "3000",
    addressCountry: "BE",
  },
  foundingDate: "2025",
  knowsAbout: [
    "Brand Identity",
    "Digital Marketing",
    "Growth Strategy",
    "Web Development",
    "SEO",
    "Social Media Marketing",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Digital Marketing Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Brand Identity",
          description:
            "Complete brand systems that communicate prestige, consistency, and authority.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Digital Marketing",
          description:
            "Multi-channel campaigns that elevate visibility and drive measurable growth.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Growth Strategy",
          description:
            "Data-driven strategies that transform brands into market leaders.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Web Development",
          description:
            "High-performance digital platforms that convert visitors into loyal clients.",
        },
      },
    ],
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Impera",
  image: `${SITE_URL}/og-image.png`,
  url: SITE_URL,
  telephone: "+32 492 20 23 77",
  email: "contact@impera-group.com",
  priceRange: "$$$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Justus Lipsiusstraat 16",
    addressLocality: "Leuven",
    postalCode: "3000",
    addressCountry: "BE",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  areaServed: "Europe",
};

const teamPersonSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Flavian",
    jobTitle: "Founder & Growth Strategist",
    worksFor: { "@type": "Organization", name: "Impera" },
    knowsAbout: ["Growth Strategy", "Finance", "Artificial Intelligence"],
    knowsLanguage: 7,
    description:
      "Multilingual founder with expertise in finance and AI, leading Impera's growth strategy.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Inna",
    jobTitle: "Senior Marketing Strategist",
    worksFor: { "@type": "Organization", name: "Impera" },
    knowsAbout: ["Digital Marketing", "Marketing Strategy"],
    description:
      "Senior Marketing Strategist with Silicon Valley experience driving Impera's marketing vision.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Aslan",
    jobTitle: "SEO & Technical Specialist",
    worksFor: { "@type": "Organization", name: "Impera" },
    knowsAbout: ["SEO", "Technical SEO", "Organic Growth"],
    description:
      "SEO & Technical Specialist focused on organic growth and search engine optimization.",
  },
];

export const defaultJsonLd = [
  organizationSchema,
  localBusinessSchema,
  ...teamPersonSchemas,
];

const SEO = ({
  title = "Impera — Command Your Digital Presence",
  description = "Impera is a premium digital media agency crafting luxury brand experiences that command authority and distinction.",
  path = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd,
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : defaultJsonLd;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter / WhatsApp */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
