// Arithmetic, validation and report ranking for the hours-lost calculator. Pure (no React), so the
// numbers can be unit-tested and reused by the report email. Every figure comes from
// src/config/calculator.ts. Values are not rounded here; round when displaying.
import { z } from "zod";
import { calculator, calculatorTaskIds, type CalculatorTaskId, type TaskFit } from "@/config/calculator";

const { people, hoursPerWeek, hourlyCost } = calculator;

const wholeNumber = (min: number, max: number, message: string) =>
  z.number({ invalid_type_error: message }).int(message).min(min, message).max(max, message);

// Error messages are dictionary keys, see ExitIntentPopup.tsx.
export const inputsSchema = z.object({
  people: wholeNumber(people.min, people.max, "calculator.steps.people.error"),
  hoursPerPerson: wholeNumber(hoursPerWeek.min, hoursPerWeek.max, "calculator.steps.hours.error"),
  hourlyCost: wholeNumber(hourlyCost.min, hourlyCost.max, "calculator.steps.cost.error"),
  tasks: z.array(z.enum(calculatorTaskIds)).min(1, "calculator.steps.tasks.error"),
});

export type CalculatorInputs = z.infer<typeof inputsSchema>;

export interface CalculatorResult {
  weeklyHours: number;
  yearlyHours: number;
  yearlyCost: number;
  automatableHours: { low: number; high: number };
  automatableCost: { low: number; high: number };
}

export const computeResult = ({
  people,
  hoursPerPerson,
  hourlyCost,
}: Pick<CalculatorInputs, "people" | "hoursPerPerson" | "hourlyCost">): CalculatorResult => {
  const { workingWeeksPerYear, automationRange } = calculator;
  const weeklyHours = people * hoursPerPerson;
  const yearlyHours = weeklyHours * workingWeeksPerYear;
  const yearlyCost = yearlyHours * hourlyCost;

  return {
    weeklyHours,
    yearlyHours,
    yearlyCost,
    automatableHours: { low: yearlyHours * automationRange.low, high: yearlyHours * automationRange.high },
    automatableCost: { low: yearlyCost * automationRange.low, high: yearlyCost * automationRange.high },
  };
};

export interface ReportTask {
  id: CalculatorTaskId;
  fit: TaskFit;
  /** The stated weekly hours split evenly across the selected tasks. We have no per-task data. */
  weeklyHours: number;
  yearlyHours: number;
}

export interface Report {
  /** High fit first, then medium; ties keep the order of the task list in the config. */
  ranked: ReportTask[];
  /** The top-ranked high-fit task that is worth the effort, if any. */
  automateFirst: ReportTask | null;
  /** Tasks with too few hours (even split) to be worth automating. */
  notWorthIt: ReportTask[];
}

const FIT_ORDER: Record<TaskFit, number> = { high: 0, medium: 1 };

export const buildReport = (inputs: CalculatorInputs): Report => {
  const { weeklyHours } = computeResult(inputs);
  const selected = calculator.tasks.filter((task) => (inputs.tasks as readonly string[]).includes(task.id));
  const perTask = selected.length ? weeklyHours / selected.length : 0;

  const ranked: ReportTask[] = selected
    .map((task) => ({
      id: task.id,
      fit: task.fit,
      weeklyHours: perTask,
      yearlyHours: perTask * calculator.workingWeeksPerYear,
    }))
    .sort((a, b) => FIT_ORDER[a.fit] - FIT_ORDER[b.fit]); // stable sort keeps config order on ties

  const notWorthIt = ranked.filter((task) => task.weeklyHours < calculator.notWorthItHoursPerWeek);
  const automateFirst = ranked.find((task) => task.fit === "high" && !notWorthIt.includes(task)) ?? null;

  return { ranked, automateFirst, notWorthIt };
};

// Belgian locales, so numbers and currency read the way a visitor expects in each language.
const LOCALES: Record<string, string> = { en: "en-IE", fr: "fr-BE", nl: "nl-BE" };

const localeFor = (language: string) => LOCALES[language.slice(0, 2)] ?? LOCALES.en;

export const formatHours = (value: number, language: string) =>
  new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).format(value);

export const formatEuro = (value: number, language: string) =>
  new Intl.NumberFormat(localeFor(language), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
