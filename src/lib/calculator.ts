// The arithmetic behind the hours-lost calculator. Kept separate from the modal
// so the numbers can be read, reviewed and unit-tested on their own. Every
// figure it uses comes from src/config/calculator.ts.
import { calculatorModel, type CalculatorTaskId } from "@/config/calculator";

export interface CalculatorInputs {
  people: number;
  hoursPerPersonPerWeek: number;
  hourlyCost: number;
  tasks: CalculatorTaskId[];
}

export interface CalculatorResult {
  hoursPerWeek: number;
  hoursPerYear: number;
  yearlyCost: number;
  /** The 30–60% planning band, applied to the yearly figures. */
  automatable: {
    hoursLow: number;
    hoursHigh: number;
    costLow: number;
    costHigh: number;
  };
}

export const calculate = ({
  people,
  hoursPerPersonPerWeek,
  hourlyCost,
}: Pick<CalculatorInputs, "people" | "hoursPerPersonPerWeek" | "hourlyCost">): CalculatorResult => {
  const { workingWeeksPerYear, automationShare } = calculatorModel;

  const hoursPerWeek = people * hoursPerPersonPerWeek;
  const hoursPerYear = hoursPerWeek * workingWeeksPerYear;
  const yearlyCost = hoursPerYear * hourlyCost;

  return {
    hoursPerWeek,
    hoursPerYear,
    yearlyCost,
    automatable: {
      hoursLow: Math.round(hoursPerYear * automationShare.low),
      hoursHigh: Math.round(hoursPerYear * automationShare.high),
      costLow: Math.round(yearlyCost * automationShare.low),
      costHigh: Math.round(yearlyCost * automationShare.high),
    },
  };
};

/** The automation band as whole percentages, for the on-screen copy. */
export const automationPercentages = {
  low: Math.round(calculatorModel.automationShare.low * 100),
  high: Math.round(calculatorModel.automationShare.high * 100),
};

// Belgian locales, so thousands and currency read the way a visitor expects in
// each language. Unknown languages fall back to the English formatting.
const LOCALES: Record<string, string> = { en: "en-IE", fr: "fr-BE", nl: "nl-BE" };

const localeFor = (language: string) => LOCALES[language.slice(0, 2)] ?? LOCALES.en;

export const formatNumber = (value: number, language: string) =>
  new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 0 }).format(value);

export const formatEuro = (value: number, language: string) =>
  new Intl.NumberFormat(localeFor(language), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
