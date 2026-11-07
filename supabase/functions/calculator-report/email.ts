// Builds the calculator emails. All wording comes from the shared calculator.json files
// (`calculator.report.*`, `calculator.tasks.*`, `calculator.result.*`), all numbers from
// src/config/calculator.ts and all brand colors from src/config/email-theme.ts, so nothing is
// written twice. Table-based HTML with inline styles and no images or tracking pixels: the charts
// are table cells, so they show with images blocked and in every mail client (Gmail and Outlook
// don't display SVG).
import { calculator } from "@/config/calculator";
import { company } from "@/config/company";
import { emailTheme } from "@/config/email-theme";
import {
  buildCharts,
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

const { navy, navyDark, gold, cream } = emailTheme;
const BODY_TEXT = "#333333";
const MUTED_TEXT = "#5b6573";
const TRACK = "#e8e3d9"; // the unfilled part of a bar
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";
const LAYOUT = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';

// Gmail's mobile apps ignore color-scheme and recolor emails in dark mode. Gmail treats a one-color
// gradient as an image and leaves it alone, so every fill is set twice: the plain color for clients
// without gradients, the gradient for Gmail. Text gets the same pair, so that a fill which survives
// can't end up with recolored, unreadable text on it. Neither is documented Gmail behavior, so check
// any change here in the Gmail app itself, in dark mode, on iOS and Android.
const solid = (color: string) => `background-color:${color};background-image:linear-gradient(${color},${color})`;
const ink = (color: string) => `color:${color};-webkit-text-fill-color:${color}`;

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Same {{name}} placeholders as i18next, so the shared copy works unchanged.
const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(values[key] ?? ""));

// The color-scheme tags ask mail apps not to recolor the email in dark mode. Apple Mail respects them;
// Gmail doesn't, see `solid` and `ink`. The media query stacks the stat tiles on phones, where the largest figures
// wouldn't fit side by side. The conditional table holds the width in Outlook, which ignores max-width.
const emailDocument = (language: Language, title: string, rows: string[]) => `<!doctype html>
<html lang="${language}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:light only}
@media only screen and (max-width:480px){
.stack{display:block!important;width:100%!important;box-sizing:border-box;padding:0 0 8px!important}
.pad{padding-left:20px!important;padding-right:20px!important}
}
</style>
</head><body style="margin:0;padding:0;${solid(cream)}">
<table ${LAYOUT} width="100%" bgcolor="${cream}" style="${solid(cream)}"><tr><td align="center" style="padding:24px 12px">
<!--[if mso]><table ${LAYOUT} width="600"><tr><td><![endif]-->
<table ${LAYOUT} width="100%" bgcolor="#ffffff" style="max-width:600px;${solid("#ffffff")}">
${rows.join("\n")}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table>
</body></html>`;

const section = (content: string, padding = "24px 32px 0") =>
  `<tr><td class="pad" style="padding:${padding}">${content}</td></tr>`;

const brandHeader = (content: string) =>
  `<tr><td class="pad" bgcolor="${navy}" style="padding:28px 32px;${solid(navy)};border-top:4px solid ${gold}">
  <p style="margin:0;font:700 15px ${SERIF};letter-spacing:4px;text-transform:uppercase;${ink(gold)}">${escapeHtml(company.name)}</p>
  ${content}
</td></tr>`;

// The gold fill sits on a table cell because Outlook ignores padding on links.
const button = (href: string, label: string) =>
  `<table ${LAYOUT}><tr><td bgcolor="${gold}" style="${solid(gold)}"><a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font:700 15px ${SANS};${ink(navyDark)};text-decoration:none">${escapeHtml(label)}</a></td></tr></table>`;

const heading = (text: string) =>
  `<h2 style="margin:0 0 12px;font:700 18px ${SERIF};${ink(navyDark)}">${escapeHtml(text)}</h2>`;
const paragraph = (text: string) =>
  `<p style="margin:0 0 8px;font:15px/1.5 ${SANS};${ink(BODY_TEXT)}">${escapeHtml(text)}</p>`;
const note = (text: string) =>
  `<p style="margin:8px 0 0;font:13px/1.5 ${SANS};${ink(MUTED_TEXT)}">${escapeHtml(text)}</p>`;

const statTile = (value: string, label: string) =>
  `<td class="stack" width="33%" valign="top" style="padding:0 4px">
  <table ${LAYOUT} width="100%" bgcolor="${cream}" style="${solid(cream)};border-top:2px solid ${gold}"><tr><td style="padding:14px 12px">
    <p style="margin:0 0 4px;font:700 20px ${SERIF};${ink(navyDark)}">${escapeHtml(value)}</p>
    <p style="margin:0;font:12px/1.4 ${SANS};${ink(MUTED_TEXT)}">${escapeHtml(label)}</p>
  </td></tr></table>
</td>`;

interface BarPart {
  ratio: number;
  color: string;
}

// Decorative: the label and value beside every bar carry the same information as text.
const bar = (parts: BarPart[]) => {
  const cells = parts
    .filter((part) => part.ratio > 0)
    .map((part) => {
      const width = Math.round(part.ratio * 1000) / 10;
      return `<td width="${width}%" height="14" bgcolor="${part.color}" style="height:14px;${solid(part.color)};font-size:0;line-height:0">&nbsp;</td>`;
    })
    .join("");
  return `<table ${LAYOUT} width="100%" aria-hidden="true"><tr>${cells}</tr></table>`;
};

const labelledValue = (label: string, value: string) =>
  `<td style="padding:0 8px 4px 0;font:14px/1.4 ${SANS};${ink(BODY_TEXT)}">${escapeHtml(label)}</td>
  <td align="right" style="padding:0 0 4px;font:700 14px/1.4 ${SANS};${ink(navyDark)};white-space:nowrap">${escapeHtml(value)}</td>`;

interface BarRow {
  label: string;
  value: string;
  ratio: number;
  color: string;
}

// One bar per row, the label and value on the line above it so long figures fit on a phone.
const barChart = (rows: BarRow[]) =>
  rows
    .map(
      (row) => `<table ${LAYOUT} width="100%"><tr>${labelledValue(row.label, row.value)}</tr></table>
${bar([
  { ratio: row.ratio, color: row.color },
  { ratio: 1 - row.ratio, color: TRACK },
])}
<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>`,
    )
    .join("\n");

// One bar split into parts, with a legend below that holds the values.
const stackedBar = (parts: BarRow[]) => `${bar(parts)}
<table ${LAYOUT} width="100%" style="margin-top:10px">${parts
  .map(
    (part) =>
      `<tr><td width="20" valign="top" style="padding:3px 0 0"><table ${LAYOUT}><tr><td width="12" height="12" bgcolor="${part.color}" style="width:12px;height:12px;${solid(part.color)};font-size:0;line-height:0">&nbsp;</td></tr></table></td>
  ${labelledValue(part.label, part.value)}</tr>`,
  )
  .join("")}</table>`;

export const buildReportEmail = (inputs: CalculatorInputs, language: Language) => {
  const t = dictionaries[language];
  const result = computeResult(inputs);
  const report = buildReport(inputs);
  const charts = buildCharts(inputs);
  const hours = (value: number) => formatHours(value, language);
  const euro = (value: number) => formatEuro(value, language);
  const percent = (value: number) => Math.round(value * 100);
  // A task id missing from a dictionary must not break the send, so fall back to the id / no text.
  const taskName = (id: string) => t.tasks[id as keyof typeof t.tasks] ?? id;
  const why = (id: string) => t.report.why[id as keyof typeof t.report.why] ?? "";
  const yearlyHoursText = (value: number) => fill(t.report.rankedHours, { hours: hours(value) });

  const { low, high } = calculator.automationRange;
  const rangePercent = { low: percent(low), high: percent(high) };

  const recoveryChart = stackedBar([
    {
      label: fill(t.report.recovery.likely, rangePercent),
      value: euro(charts.recovery.likely),
      ratio: charts.recovery.likely / result.yearlyCost,
      color: navy,
    },
    {
      label: fill(t.report.recovery.possible, rangePercent),
      value: euro(charts.recovery.possible),
      ratio: charts.recovery.possible / result.yearlyCost,
      color: gold,
    },
    {
      label: t.report.recovery.rest,
      value: euro(charts.recovery.rest),
      ratio: charts.recovery.rest / result.yearlyCost,
      color: TRACK,
    },
  ]);

  const longestWait = Math.max(...charts.costOfWaiting.map((step) => step.cost));
  const waitingChart = barChart(
    charts.costOfWaiting.map((step) => ({
      label: step.years === 1 ? t.report.waiting.oneYear : fill(t.report.waiting.years, { years: step.years }),
      value: euro(step.cost),
      ratio: step.cost / longestWait,
      color: gold,
    })),
  );

  const fitChart = barChart(
    (["high", "medium"] as const).map((fit) => ({
      label: t.report.fit[fit],
      value: yearlyHoursText(charts.hoursByFit[fit]),
      ratio: charts.hoursByFit[fit] / result.yearlyHours,
      color: fit === "high" ? gold : navy,
    })),
  );

  const callout = (content: string) =>
    `<table ${LAYOUT} width="100%" bgcolor="${navy}" style="${solid(navy)}"><tr><td style="padding:20px 24px">
    <p style="margin:0 0 8px;font:700 12px ${SANS};letter-spacing:2px;text-transform:uppercase;${ink(gold)}">${escapeHtml(t.report.automateFirstTitle)}</p>
    ${content}
  </td></tr></table>`;

  const automateFirstHtml = report.automateFirst
    ? callout(`<p style="margin:0 0 4px;font:700 20px ${SERIF};${ink(cream)}">${escapeHtml(taskName(report.automateFirst.id))}</p>
    <p style="margin:0;font:14px/1.5 ${SANS};${ink(cream)}">${escapeHtml(why(report.automateFirst.id))}</p>`)
    : callout(`<p style="margin:0;font:14px/1.5 ${SANS};${ink(cream)}">${escapeHtml(t.report.automateFirstNone)}</p>`);

  const fitBadge = (fit: "high" | "medium") => {
    const [background, color] = fit === "high" ? [gold, navyDark] : [navy, cream];
    return `<span style="padding:2px 8px;${solid(background)};${ink(color)};font:700 11px ${SANS};white-space:nowrap">${escapeHtml(t.report.fit[fit])}</span>`;
  };

  const taskCardsHtml = report.ranked
    .map(
      (task) => `<table ${LAYOUT} width="100%" bgcolor="${cream}" style="${solid(cream)};border-left:3px solid ${task.fit === "high" ? gold : navy}"><tr><td style="padding:14px 16px">
    <p style="margin:0 0 6px;font:700 16px ${SERIF};${ink(navyDark)}">${escapeHtml(taskName(task.id))}</p>
    <p style="margin:0 0 6px;font:13px/1.6 ${SANS};${ink(MUTED_TEXT)}">${fitBadge(task.fit)} &nbsp;${escapeHtml(yearlyHoursText(task.yearlyHours))}</p>
    <p style="margin:0;font:14px/1.5 ${SANS};${ink(BODY_TEXT)}">${escapeHtml(why(task.id))}</p>
  </td></tr></table>
  <div style="height:8px;line-height:8px;font-size:0">&nbsp;</div>`,
    )
    .join("\n");

  const notWorthItHtml = report.notWorthIt.length
    ? `<ul style="margin:0;padding-left:20px">${report.notWorthIt
        .map(
          (task) =>
            `<li style="margin:0 0 6px;font:15px/1.5 ${SANS};${ink(BODY_TEXT)}">${escapeHtml(taskName(task.id))}: ${escapeHtml(
              fill(t.report.notWorthItReason, { hours: formatHours(task.weeklyHours, language, 1) }),
            )}</li>`,
        )
        .join("")}</ul>`
    : paragraph(t.report.notWorthItNone);

  const inputsLine = fill(t.report.inputsLine, {
    people: inputs.people,
    hours: inputs.hoursPerPerson,
    cost: euro(inputs.hourlyCost),
  });

  const assumptions = [
    fill(t.result.assumptionInputs, {
      people: inputs.people,
      hours: inputs.hoursPerPerson,
      cost: euro(inputs.hourlyCost),
    }),
    fill(t.result.assumptionWeeks, { weeks: calculator.workingWeeksPerYear }),
    fill(t.result.assumptionRange, rangePercent),
    t.report.assumptionEvenSplit,
    t.report.assumptionFit,
  ];

  const subject = fill(t.report.subject, { hours: hours(result.yearlyHours) });

  const html = emailDocument(language, subject, [
    brandHeader(`<p style="margin:20px 0 4px;font:14px/1.4 ${SANS};${ink(cream)}">${escapeHtml(t.report.headline)}</p>
  <h1 style="margin:0 0 8px;font:700 38px/1.2 ${SERIF};${ink(gold)}">${escapeHtml(euro(result.yearlyCost))}</h1>
  <p style="margin:0;font:13px/1.5 ${SANS};${ink(cream)}">${escapeHtml(inputsLine)}</p>`),
    section(paragraph(t.report.intro)),
    section(
      `<table ${LAYOUT} width="100%"><tr>
  ${statTile(hours(result.weeklyHours), t.result.hoursPerWeek)}
  ${statTile(hours(result.yearlyHours), t.result.hoursPerYear)}
  ${statTile(euro(result.yearlyCost), t.result.yearlyCost)}
</tr></table>`,
      "12px 28px 0",
    ),
    section(`${heading(t.report.recovery.title)}
${recoveryChart}
${note(
  fill(t.report.range, {
    hours: `${hours(result.automatableHours.low)} – ${hours(result.automatableHours.high)}`,
    cost: `${euro(result.automatableCost.low)} – ${euro(result.automatableCost.high)}`,
  }),
)}`),
    section(`${heading(t.report.waiting.title)}
${waitingChart}
${note(t.report.waiting.note)}`),
    section(`${heading(t.report.hoursByFitTitle)}
${fitChart}`),
    section(automateFirstHtml),
    section(`${heading(t.report.rankedTitle)}
${taskCardsHtml}`),
    section(`${heading(t.report.notWorthItTitle)}
${notWorthItHtml}`),
    section(
      `${heading(t.report.assumptionsTitle)}
<ul style="margin:0 0 8px;padding-left:20px">${assumptions
        .map((text) => `<li style="margin:0 0 4px;font:13px/1.5 ${SANS};${ink(MUTED_TEXT)}">${escapeHtml(text)}</li>`)
        .join("")}</ul>
${note(t.report.disclaimer)}`,
      "24px 32px 28px",
    ),
    `<tr><td class="pad" bgcolor="${navy}" style="padding:28px 32px;${solid(navy)}">
  <p style="margin:0 0 16px;font:700 20px/1.3 ${SERIF};${ink(cream)}">${escapeHtml(t.report.auditText)}</p>
  ${button(company.calendlyUrl, t.report.auditCta)}
</td></tr>`,
  ]);

  return { subject, html };
};

// The short email that comes first: one button, no report content. The report is only sent after the
// address owner opens the link (double opt-in), so this must not reveal anything about the inputs.
export const buildConfirmationEmail = (language: Language, confirmUrl: string) => {
  const t = dictionaries[language].confirmEmail;
  const subject = t.subject;

  const html = emailDocument(language, subject, [
    brandHeader(`<h1 style="margin:16px 0 0;font:700 24px/1.3 ${SERIF};${ink(cream)}">${escapeHtml(subject)}</h1>`),
    section(
      `<p style="margin:0 0 20px;font:15px/1.5 ${SANS};${ink(BODY_TEXT)}">${escapeHtml(t.intro)}</p>
${button(confirmUrl, t.button)}
<p style="margin:20px 0 8px;font:13px/1.5 ${SANS};${ink(MUTED_TEXT)}">${escapeHtml(t.expires)}</p>
<p style="margin:0;font:13px/1.5 ${SANS};${ink(MUTED_TEXT)}">${escapeHtml(t.ignore)}</p>`,
      "24px 32px 32px",
    ),
  ]);

  return { subject, html };
};
