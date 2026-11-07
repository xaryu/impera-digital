import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { emailTheme } from "@/config/email-theme";

const css = readFileSync(join(__dirname, "../index.css"), "utf8");

const hslToHex = (h: number, s: number, l: number) => {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

const cssColor = (name: string) => {
  const match = css.match(new RegExp(`--${name}:\\s*(\\d+)\\s+(\\d+)%\\s+(\\d+)%`));
  if (!match) throw new Error(`--${name} not found in index.css`);
  return hslToHex(Number(match[1]), Number(match[2]), Number(match[3]));
};

describe("emailTheme", () => {
  it.each([
    ["navy", emailTheme.navy],
    ["navy-dark", emailTheme.navyDark],
    ["gold", emailTheme.gold],
    ["cream", emailTheme.cream],
  ])("%s matches the site's CSS variable", (name, hex) => {
    expect(hex).toBe(cssColor(name));
  });
});
