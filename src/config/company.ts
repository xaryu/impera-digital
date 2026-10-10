// Company details and contact information, used across the site (footer, contact page, legal
// pages, search-engine data). Change them here and every page updates.

export const company = {
  name: "Impera",
  siteUrl: "https://impera-digital.vercel.app",
  email: "contact@impera-group.com",
  careersEmail: "careers@impera-group.com",
  phone: {
    display: "+32 492 20 23 77",
    href: "tel:+32492202377",
  },
  address: {
    street: "Justus Lipsiusstraat 16",
    postalCode: "3000",
    city: "Leuven",
    country: "Belgium",
    countryCode: "BE",
  },
  calendlyUrl: "https://calendly.com/flavianconstantinovici48/30min",
} as const;

export const companyAddressLine = `${company.address.street}, ${company.address.postalCode} ${company.address.city}`;
