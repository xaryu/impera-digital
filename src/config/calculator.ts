// Numbers and assumptions behind the "How many hours is your team losing?" calculator. Change them
// here; the modal, the result small print and the report email all follow. The wording lives in
// src/i18n/locales/<lang>/calculator.json.
//
// None of these are measured statistics. The 30-60% range is Impera's own estimate and the task
// fit levels are Impera's own judgement. Both are labelled as such to the visitor.

/** How well a task automates: a label, never a percentage. */
export type TaskFit = "high" | "medium";

export const calculator = {
  people: { min: 1, max: 50, default: 3 },
  hoursPerWeek: { min: 1, max: 20, default: 5 },
  hourlyCost: { min: 10, max: 500, default: 40 },
  workingWeeksPerYear: 46,
  automationRange: { low: 0.3, high: 0.6 },
  /** Hours per week, split evenly across the selected tasks, below which a task is "probably not worth it". */
  notWorthItHoursPerWeek: 2,
  /** In display order. `id` matches the keys under `calculator.tasks.<id>` in the translation files. */
  tasks: [
    { id: "documents", fit: "high" },
    { id: "dataEntry", fit: "high" },
    { id: "invoicing", fit: "high" },
    { id: "followUps", fit: "medium" },
    { id: "reporting", fit: "medium" },
    { id: "quotes", fit: "medium" },
  ],
} as const satisfies {
  tasks: readonly { id: string; fit: TaskFit }[];
  [key: string]: unknown;
};

export type CalculatorTaskId = (typeof calculator.tasks)[number]["id"];

export const calculatorTaskIds = calculator.tasks.map((task) => task.id) as [
  CalculatorTaskId,
  ...CalculatorTaskId[],
];
