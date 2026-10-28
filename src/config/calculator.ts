// Every number behind the "How many hours is your team losing?" calculator lives
// here. The wording lives in src/i18n/locales/<language>/calculator.json — change
// a figure here and the modal, the result and the emailed report all follow.
//
// None of these are measured statistics. WORKING_WEEKS_PER_YEAR is a calendar
// assumption, the automation band is the planning range we scope with, and the
// task tiers are our own judgement about what automates easily. All three are
// stated to the visitor in plain text on the result screen.

export const calculatorModel = {
  /** Weeks actually worked in a year, after holidays and public holidays. */
  workingWeeksPerYear: 46,

  /**
   * Share of the measured hours we treat as realistically automatable when we
   * scope a project. Deliberately a band: where a business lands inside it
   * depends on its tools, its data and how consistent the process already is.
   */
  automationShare: { low: 0.3, high: 0.6 },

  people: { min: 1, max: 50, default: 3, step: 1 },
  hoursPerPersonPerWeek: { min: 1, max: 20, default: 6, step: 1 },
  hourlyCost: { min: 5, max: 500, default: 40, step: 5 },
} as const;

/**
 * Automation readiness, our judgement rather than a measurement:
 *  - "high"   rule-driven and repetitive, where we normally start
 *  - "medium" automatable in part, a person still reviews the output
 *  - "low"    needs judgement every time, usually not worth automating end to end
 *
 * `order` is the order the tasks are shown in; the tier decides how they rank
 * in the emailed breakdown. Task ids match the keys under
 * `calculator.tasks.<id>` in the translation files.
 */
export type TaskTier = "high" | "medium" | "low";

export const calculatorTasks = [
  { id: "documentProcessing", tier: "high" },
  { id: "dataEntry", tier: "high" },
  { id: "quotes", tier: "low" },
  { id: "followUpEmails", tier: "medium" },
  { id: "reporting", tier: "medium" },
  { id: "invoicing", tier: "high" },
] as const satisfies readonly { id: string; tier: TaskTier }[];

export type CalculatorTaskId = (typeof calculatorTasks)[number]["id"];

export const calculatorTaskIds = calculatorTasks.map((task) => task.id) as readonly CalculatorTaskId[];
