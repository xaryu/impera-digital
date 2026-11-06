// The Edge Function's email templates, tested here because vitest only picks up files under src/.
import { describe, expect, it } from "vitest";
import { calculatorTaskIds } from "@/config/calculator";
import { emailTheme } from "@/config/email-theme";
import type { CalculatorInputs } from "@/lib/calculator";
import { buildConfirmationEmail, buildReportEmail, type Language } from "../../supabase/functions/calculator-report/email.ts";

const languages: Language[] = ["en", "fr", "nl"];

const samples: [string, CalculatorInputs][] = [
  ["smallest", { people: 1, hoursPerPerson: 1, hourlyCost: 10, tasks: ["followUps"] }],
  ["default", { people: 3, hoursPerPerson: 5, hourlyCost: 40, tasks: ["documents", "dataEntry", "quotes"] }],
  ["largest", { people: 50, hoursPerPerson: 20, hourlyCost: 500, tasks: [...calculatorTaskIds] }],
];

// Gmail clips messages above 102 KB.
const MAX_BYTES = 100 * 1024;

const expectCleanHtml = (html: string) => {
  expect(html).not.toContain("undefined");
  expect(html).not.toContain("NaN");
  expect(html).not.toContain("{{");
  expect(new TextEncoder().encode(html).length).toBeLessThan(MAX_BYTES);
};

describe("buildReportEmail", () => {
  describe.each(languages)("%s", (language) => {
    it.each(samples)("renders the %s inputs", (_, inputs) => {
      const { subject, html } = buildReportEmail(inputs, language);
      expect(subject).not.toContain("{{");
      expect(html).toContain(`<html lang="${language}">`);
      expectCleanHtml(html);
    });
  });

  const defaults = samples[1][1];

  it("shows the headline cost and the chart figures", () => {
    const { html } = buildReportEmail(defaults, "en");
    expect(html).toContain("€27,600"); // headline and tile
    expect(html).toContain("€8,280"); // likely and possible
    expect(html).toContain("€11,040"); // stays manual
    expect(html).toContain("€82,800"); // 3 years
    expect(html).toContain("€138,000"); // 5 years
    expect(html).toContain("about 460 h a year"); // high fit
    expect(html).toContain("about 230 h a year"); // medium fit
  });

  it("uses the site's colors and no gold text on white", () => {
    const { html } = buildReportEmail(defaults, "en");
    expect(html).toContain(emailTheme.gold);
    expect(html).toContain(emailTheme.navy);
    expect(html).not.toContain("#c9a24a");
    expect(html).not.toContain("#0f1b33");
    expect(html).not.toContain("#f6f1e7");
  });

  it("has no images, so charts show when images are blocked", () => {
    const { html } = buildReportEmail(defaults, "en");
    expect(html).not.toMatch(/<(img|svg)\b/i);
  });

  it("links the audit button to the calendar", () => {
    const { html } = buildReportEmail(defaults, "en");
    expect(html).toContain("calendly.com");
  });

  it("omits the bar for a fit with no selected tasks instead of drawing a zero-width cell", () => {
    const { html } = buildReportEmail({ ...defaults, tasks: ["documents"] }, "en");
    expect(html).not.toContain('width="0%"');
  });
});

describe("buildConfirmationEmail", () => {
  it.each(languages)("renders in %s", (language) => {
    const { html } = buildConfirmationEmail(language, "https://example.com/confirm?token=abc");
    expect(html).toContain("https://example.com/confirm?token=abc");
    expectCleanHtml(html);
  });

  it("escapes the confirmation link", () => {
    const { html } = buildConfirmationEmail("en", 'https://example.com/?a="><script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&quot;&gt;&lt;script&gt;");
  });

  it("reveals nothing about the visitor's figures", () => {
    const { html } = buildConfirmationEmail("en", "https://example.com/confirm");
    expect(html).not.toContain("€");
  });
});
