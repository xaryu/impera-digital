import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { calculatorModel, calculatorTasks } from "@/config/calculator";
import { automationPercentages, calculate, formatEuro, formatNumber } from "@/lib/calculator";

describe("calculate", () => {
  it("multiplies people by hours, then by the working year", () => {
    const result = calculate({ people: 4, hoursPerPersonPerWeek: 5, hourlyCost: 40 });

    expect(result.hoursPerWeek).toBe(20);
    expect(result.hoursPerYear).toBe(20 * calculatorModel.workingWeeksPerYear);
    expect(result.yearlyCost).toBe(result.hoursPerYear * 40);
  });

  it("reports the automatable band as a share of the yearly hours and cost", () => {
    const result = calculate({ people: 10, hoursPerPersonPerWeek: 10, hourlyCost: 50 });
    const { low, high } = calculatorModel.automationShare;

    expect(result.automatable.hoursLow).toBe(Math.round(result.hoursPerYear * low));
    expect(result.automatable.hoursHigh).toBe(Math.round(result.hoursPerYear * high));
    expect(result.automatable.costLow).toBe(Math.round(result.yearlyCost * low));
    expect(result.automatable.costHigh).toBe(Math.round(result.yearlyCost * high));
    expect(result.automatable.hoursLow).toBeLessThan(result.automatable.hoursHigh);
  });

  it("stays at the smallest sensible figure for a single person", () => {
    const result = calculate({ people: 1, hoursPerPersonPerWeek: 1, hourlyCost: 40 });

    expect(result.hoursPerWeek).toBe(1);
    expect(result.hoursPerYear).toBe(calculatorModel.workingWeeksPerYear);
    expect(result.yearlyCost).toBe(calculatorModel.workingWeeksPerYear * 40);
  });
});

describe("formatting", () => {
  it("writes whole numbers and euros without decimals", () => {
    expect(formatNumber(1380, "en")).toMatch(/1.380|1,380/);
    expect(formatEuro(55200, "nl")).toContain("€");
    expect(formatEuro(55200, "en")).not.toMatch(/[.,]\d\d$/);
  });

  it("exposes the automation band as whole percentages", () => {
    expect(automationPercentages).toEqual({ low: 30, high: 60 });
  });
});

// The edge function cannot import from src/, so it carries its own copy of the
// model. This keeps the two honest: change a figure in one and this fails.
describe("edge function model mirror", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../../supabase/functions/send-calculator-report/model.ts"),
    "utf8",
  );

  const constant = (name: string) => {
    const match = source.match(new RegExp(`export const ${name} = ([0-9.]+);`));
    return match ? Number(match[1]) : null;
  };

  it("uses the same working year and automation band", () => {
    expect(constant("WORKING_WEEKS_PER_YEAR")).toBe(calculatorModel.workingWeeksPerYear);
    expect(constant("AUTOMATION_SHARE_LOW")).toBe(calculatorModel.automationShare.low);
    expect(constant("AUTOMATION_SHARE_HIGH")).toBe(calculatorModel.automationShare.high);
  });

  it("knows the same tasks, in the same tiers", () => {
    const mirrored = [...source.matchAll(/\{ id: "(\w+)", tier: "(\w+)" \}/g)].map(([, id, tier]) => ({ id, tier }));
    expect(mirrored).toEqual(calculatorTasks.map(({ id, tier }) => ({ id, tier })));
  });

  it("clamps the inputs to the ranges the modal offers", () => {
    const limits = source.match(/export const LIMITS = \{([\s\S]*?)\n\};/)?.[1] ?? "";
    expect(limits).toContain(`people: { min: ${calculatorModel.people.min}, max: ${calculatorModel.people.max} }`);
    expect(limits).toContain(
      `hoursPerPersonPerWeek: { min: ${calculatorModel.hoursPerPersonPerWeek.min}, max: ${calculatorModel.hoursPerPersonPerWeek.max} }`,
    );
    expect(limits).toContain(
      `hourlyCost: { min: ${calculatorModel.hourlyCost.min}, max: ${calculatorModel.hourlyCost.max} }`,
    );
  });
});
