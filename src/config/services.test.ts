// The services list builds its dictionary keys at runtime (`servicesPage.${titleKey}`), which the
// key scanner in src/i18n/dictionaries.test.ts can't see. Check them here instead, so a renamed or
// deleted text fails the tests rather than showing a raw key on the site.
import { describe, expect, it } from "vitest";
import { resources, supportedLanguages } from "@/i18n/resources";
import { services } from "./services";

const keysOf = (service: (typeof services)[number]) => [
  service.titleKey,
  service.taglineKey,
  service.descKey,
  ...service.deliverables,
];

describe("services config", () => {
  it.each(supportedLanguages)("every service text exists in %s", (lang) => {
    const page = resources[lang].translation.servicesPage as Record<string, unknown>;
    const missing = services.flatMap(keysOf).filter((key) => typeof page[key] !== "string" || page[key] === "");
    expect(missing).toEqual([]);
  });

  it("has unique anchors", () => {
    const ids = services.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
