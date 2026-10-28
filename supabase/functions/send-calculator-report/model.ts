// Mirror of src/config/calculator.ts, kept here because Supabase edge functions
// are bundled from this directory and cannot import from src/.
//
// src/config/calculator.ts is the source of truth. The two are held in step by
// src/lib/calculator.model.test.ts, which fails the build if a figure is
// changed in one place and not the other.

export const WORKING_WEEKS_PER_YEAR = 46;
export const AUTOMATION_SHARE_LOW = 0.3;
export const AUTOMATION_SHARE_HIGH = 0.6;

export const LIMITS = {
  people: { min: 1, max: 50 },
  hoursPerPersonPerWeek: { min: 1, max: 20 },
  hourlyCost: { min: 5, max: 500 },
};

export type TaskTier = "high" | "medium" | "low";

export const TASKS: { id: string; tier: TaskTier }[] = [
  { id: "documentProcessing", tier: "high" },
  { id: "dataEntry", tier: "high" },
  { id: "quotes", tier: "low" },
  { id: "followUpEmails", tier: "medium" },
  { id: "reporting", tier: "medium" },
  { id: "invoicing", tier: "high" },
];

export interface Inputs {
  people: number;
  hoursPerPersonPerWeek: number;
  hourlyCost: number;
  tasks: string[];
}

export interface Result {
  hoursPerWeek: number;
  hoursPerYear: number;
  yearlyCost: number;
  automatable: {
    hoursLow: number;
    hoursHigh: number;
    costLow: number;
    costHigh: number;
  };
}

/** Same arithmetic as src/lib/calculator.ts — recomputed here so what we store
 *  and email comes from the inputs, never from numbers the browser sent. */
export const calculate = (inputs: Inputs): Result => {
  const hoursPerWeek = inputs.people * inputs.hoursPerPersonPerWeek;
  const hoursPerYear = hoursPerWeek * WORKING_WEEKS_PER_YEAR;
  const yearlyCost = hoursPerYear * inputs.hourlyCost;

  return {
    hoursPerWeek,
    hoursPerYear,
    yearlyCost,
    automatable: {
      hoursLow: Math.round(hoursPerYear * AUTOMATION_SHARE_LOW),
      hoursHigh: Math.round(hoursPerYear * AUTOMATION_SHARE_HIGH),
      costLow: Math.round(yearlyCost * AUTOMATION_SHARE_LOW),
      costHigh: Math.round(yearlyCost * AUTOMATION_SHARE_HIGH),
    },
  };
};
