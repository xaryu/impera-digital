import { describe, expect, it } from "vitest";
import { calculator } from "@/config/calculator";
import { buildReport, computeResult, formatEuro, formatHours, inputsSchema } from "@/lib/calculator";

const base = { people: 3, hoursPerPerson: 5, hourlyCost: 40, tasks: ["documents" as const] };

describe("computeResult", () => {
  it("matches the worked example: 3 people x 5 h x 40 EUR", () => {
    const r = computeResult(base);
    expect(r.weeklyHours).toBe(15);
    expect(r.yearlyHours).toBe(690);
    expect(r.yearlyCost).toBe(27600);
    expect(Math.round(r.automatableHours.low)).toBe(207);
    expect(Math.round(r.automatableHours.high)).toBe(414);
    expect(Math.round(r.automatableCost.low)).toBe(8280);
    expect(Math.round(r.automatableCost.high)).toBe(16560);
  });

  it("handles the minimum and maximum inputs", () => {
    const min = computeResult({ people: 1, hoursPerPerson: 1, hourlyCost: calculator.hourlyCost.min });
    expect(min.yearlyHours).toBe(calculator.workingWeeksPerYear);
    const max = computeResult({ people: 50, hoursPerPerson: 20, hourlyCost: 500 });
    expect(max.weeklyHours).toBe(1000);
    expect(max.yearlyCost).toBe(1000 * calculator.workingWeeksPerYear * 500);
  });
});

describe("inputsSchema", () => {
  it("accepts the limits and rejects values outside them", () => {
    expect(inputsSchema.safeParse(base).success).toBe(true);
    expect(inputsSchema.safeParse({ ...base, people: 0 }).success).toBe(false);
    expect(inputsSchema.safeParse({ ...base, people: 51 }).success).toBe(false);
    expect(inputsSchema.safeParse({ ...base, hoursPerPerson: 21 }).success).toBe(false);
    expect(inputsSchema.safeParse({ ...base, hourlyCost: 9 }).success).toBe(false);
    expect(inputsSchema.safeParse({ ...base, people: 2.5 }).success).toBe(false);
  });

  it("needs at least one known task", () => {
    expect(inputsSchema.safeParse({ ...base, tasks: [] }).success).toBe(false);
    expect(inputsSchema.safeParse({ ...base, tasks: ["nope"] }).success).toBe(false);
  });
});

describe("buildReport", () => {
  it("ranks high-fit tasks before medium, keeping config order on ties", () => {
    const report = buildReport({ ...base, tasks: ["reporting", "invoicing", "followUps", "documents"] });
    expect(report.ranked.map((t) => t.id)).toEqual(["documents", "invoicing", "followUps", "reporting"]);
  });

  it("splits the weekly hours evenly across the selected tasks", () => {
    const report = buildReport({ ...base, tasks: ["documents", "quotes", "reporting"] });
    expect(report.ranked.every((t) => t.weeklyHours === 5)).toBe(true);
    expect(report.ranked[0].yearlyHours).toBe(5 * calculator.workingWeeksPerYear);
  });

  it("picks the first high-fit task as 'automate first'", () => {
    expect(buildReport({ ...base, tasks: ["quotes", "dataEntry", "invoicing"] }).automateFirst?.id).toBe("dataEntry");
  });

  it("has no 'automate first' when only medium-fit tasks are selected", () => {
    expect(buildReport({ ...base, tasks: ["quotes", "reporting"] }).automateFirst).toBeNull();
  });

  it("flags tasks under the hours threshold as not worth it and never recommends them first", () => {
    // 1 person x 3 h across 2 tasks = 1.5 h/week each, under the 2 h threshold.
    const report = buildReport({ people: 1, hoursPerPerson: 3, hourlyCost: 40, tasks: ["documents", "quotes"] });
    expect(report.notWorthIt.map((t) => t.id)).toEqual(["documents", "quotes"]);
    expect(report.automateFirst).toBeNull();
  });

  it("flags nothing when every task clears the threshold", () => {
    expect(buildReport(base).notWorthIt).toEqual([]);
  });
});

describe("formatting", () => {
  it("formats per language with whole numbers and euros", () => {
    expect(formatHours(1380.4, "en")).toBe("1,380");
    expect(formatEuro(27600, "en")).toContain("27,600");
    expect(formatEuro(27600, "nl")).toContain("€");
  });
});
