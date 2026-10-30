// Builds the calculator report email. All wording comes from the shared calculator.json files
// (`calculator.report.*`, `calculator.tasks.*`, `calculator.result.*`) and all numbers from
// src/config/calculator.ts, so nothing is written twice. Plain HTML with inline styles, no images
// and no tracking pixels.
import { calculator } from "@/config/calculator";
import { company } from "@/config/company";
import {
  buildReport,
  computeResult,
  formatEuro,
  formatHours,
  type CalculatorInputs,
} from "../_shared/lib/calculator.ts";
import en from "../_shared/locales/en/calculator.json" with { type: "json" };
import fr from "../_shared/locales/fr/calculator.json" with { type: "json" };
import nl from "../_shared/locales/nl/calculator.json" with { type: "json" };

export type Language = "en" | "fr" | "nl";

const dictionaries: Record<Language, typeof en.calculator> = {
  en: en.calculator,
  fr: fr.calculator,
  nl: nl.calculator,
};

const NAVY = "#0f1b33";
const GOLD = "#c9a24a";

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Same {{name}} placeholders as i18next, so the shared copy works unchanged.
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ""));

export const buildReportEmail = (inputs: CalculatorInputs, language: Language) => {
  const t = dictionaries[language];
  const result = computeResult(inputs);
  const report = buildReport(inputs);
  const hours = (value: number) => formatHours(value, language);
  const euro = (value: number) => formatEuro(value, language);
  const percent = (value: number) => Math.round(value * 100);
  // A task id missing from a dictionary must not break the send, so fall back to the id / no text.
  const taskName = (id: string) => t.tasks[id as keyof typeof t.tasks] ?? id;
  const why = (id: string) => t.report.why[id as keyof typeof t.report.why] ?? "";
  const fitLabel = (fit: "high" | "medium") => t.report.fit[fit];

  const heading = (text: string) =>
    `<h2 style="margin:28px 0 8px;font:600 18px Georgia,serif;color:${NAVY}">${escapeHtml(text)}</h2>`;
  const paragraph = (text: string) =>
    `<p style="margin:0 0 8px;font:15px/1.5 Arial,sans-serif;color:#333">${escapeHtml(text)}</p>`;
  const small = (text: string) =>
    `<li style="margin:0 0 4px;font:13px/1.5 Arial,sans-serif;color:#666">${escapeHtml(text)}</li>`;

  const rankedHtml = report.ranked
    .map(
      (task) => `<li style="margin:0 0 10px;font:15px/1.5 Arial,sans-serif;color:#333">
        <strong>${escapeHtml(taskName(task.id))}</strong>
        <span style="color:${GOLD}"> · ${escapeHtml(fitLabel(task.fit))}</span><br>
        ${escapeHtml(fill(t.report.rankedHours, { hours: hours(task.yearlyHours) }))}<br>
        <span style="color:#666">${escapeHtml(why(task.id))}</span></li>`,
    )
    .join("");

  const automateFirstHtml = report.automateFirst
    ? paragraph(`${taskName(report.automateFirst.id)}: ${why(report.automateFirst.id)}`)
    : paragraph(t.report.automateFirstNone);

  const notWorthItHtml = report.notWorthIt.length
    ? `<ul style="margin:0 0 8px;padding-left:20px">${report.notWorthIt
        .map(
          (task) =>
            `<li style="margin:0 0 6px;font:15px/1.5 Arial,sans-serif;color:#333">${escapeHtml(taskName(task.id))}: ${escapeHtml(
              fill(t.report.notWorthItReason, { hours: formatHours(task.weeklyHours, language, 1) }),
            )}</li>`,
        )
        .join("")}</ul>`
    : paragraph(t.report.notWorthItNone);

  const { low, high } = calculator.automationRange;
  const assumptions = [
    fill(t.result.assumptionInputs, {
      people: inputs.people,
      hours: inputs.hoursPerPerson,
      cost: euro(inputs.hourlyCost),
    }),
    fill(t.result.assumptionWeeks, { weeks: calculator.workingWeeksPerYear }),
    fill(t.result.assumptionRange, { low: percent(low), high: percent(high) }),
    t.report.assumptionEvenSplit,
    t.report.assumptionFit,
  ];

  const subject = fill(t.report.subject, { hours: hours(result.yearlyHours) });

  const html = `<!doctype html>
<html lang="${language}"><body style="margin:0;padding:24px;background:#f6f1e7">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px;border-top:4px solid ${GOLD}">
  <p style="margin:0 0 4px;font:600 13px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:${GOLD}">${escapeHtml(company.name)}</p>
  <h1 style="margin:0 0 12px;font:600 24px Georgia,serif;color:${NAVY}">${escapeHtml(subject)}</h1>
  ${paragraph(t.report.intro)}
  ${heading(t.report.inputsTitle)}
  ${paragraph(
    fill(t.report.inputsLine, {
      people: inputs.people,
      hours: inputs.hoursPerPerson,
      cost: euro(inputs.hourlyCost),
    }),
  )}
  ${heading(t.report.resultTitle)}
  ${paragraph(fill(t.report.weekly, { value: hours(result.weeklyHours) }))}
  ${paragraph(fill(t.report.yearly, { value: hours(result.yearlyHours) }))}
  ${paragraph(fill(t.report.cost, { value: euro(result.yearlyCost) }))}
  ${paragraph(
    fill(t.report.range, {
      hours: `${hours(result.automatableHours.low)} – ${hours(result.automatableHours.high)}`,
      cost: `${euro(result.automatableCost.low)} – ${euro(result.automatableCost.high)}`,
    }),
  )}
  ${heading(t.report.rankedTitle)}
  <ol style="margin:0 0 8px;padding-left:20px">${rankedHtml}</ol>
  ${heading(t.report.automateFirstTitle)}
  ${automateFirstHtml}
  ${heading(t.report.notWorthItTitle)}
  ${notWorthItHtml}
  ${heading(t.report.assumptionsTitle)}
  <ul style="margin:0 0 8px;padding-left:20px">${assumptions.map(small).join("")}</ul>
  ${paragraph(t.report.disclaimer)}
  ${heading(t.report.auditText)}
  <p style="margin:12px 0 0"><a href="${escapeHtml(company.calendlyUrl)}" style="display:inline-block;padding:12px 24px;background:${GOLD};color:${NAVY};font:600 15px Arial,sans-serif;text-decoration:none;border-radius:4px">${escapeHtml(t.report.auditCta)}</a></p>
</div></body></html>`;

  return { subject, html };
};
