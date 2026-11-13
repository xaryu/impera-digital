// The services shown on the Services page, in display order. The footer and the search-engine
// data read this list too, so a service added or removed here shows up everywhere.
//
// `id` is the section's anchor on the Services page (/services#ai-automation). It is part of
// public URLs, so keep it stable even if the title changes. Text lives in the dictionaries
// (`servicesPage.*` in src/i18n/locales/<lang>/services.json).

export const services = [
  {
    id: "ai-automation",
    titleKey: "aiAutomation",
    taglineKey: "aiAutomationTagline",
    descKey: "aiAutomationDesc",
    deliverables: ["aiD1", "aiD2", "aiD3", "aiD4", "aiD5"],
  },
  {
    id: "web-development",
    titleKey: "webDesign",
    taglineKey: "webDesignTagline",
    descKey: "webDesignDesc",
    deliverables: ["webD1", "webD2", "webD3", "webD4", "webD5"],
  },
  {
    id: "digital-marketing",
    titleKey: "digitalMarketing",
    taglineKey: "digitalMarketingTagline",
    descKey: "digitalMarketingDesc",
    deliverables: ["marketingD1", "marketingD2", "marketingD3", "marketingD4", "marketingD5"],
  },
  {
    id: "growth-strategy",
    titleKey: "growthStrategy",
    taglineKey: "growthStrategyTagline",
    descKey: "growthStrategyDesc",
    deliverables: ["growthD1", "growthD2", "growthD3", "growthD4", "growthD5"],
  },
] as const;

export type ServiceId = (typeof services)[number]["id"];
