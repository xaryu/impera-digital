// Guards the translation files in src/i18n/locales against the mistakes that are
// easy to make while editing text: a key missing in one language, an empty
// value, a broken {{placeholder}} or <link> tag, or a key the code needs that
// no longer exists. Run with `npm test`.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resources, supportedLanguages } from "./resources";

const LOCALES_DIR = path.resolve(__dirname, "locales");
const SRC_DIR = path.resolve(__dirname, "..");
const BASE = "en";

type Dict = { [key: string]: string | Dict };

const flatten = (dict: Dict, prefix = ""): Record<string, string> =>
  Object.entries(dict).reduce<Record<string, string>>((acc, [key, value]) => {
    const fullKey = prefix + key;
    if (typeof value === "string") acc[fullKey] = value;
    else Object.assign(acc, flatten(value, `${fullKey}.`));
    return acc;
  }, {});

const listFiles = (lang: string) =>
  fs.readdirSync(path.join(LOCALES_DIR, lang)).filter((f) => f.endsWith(".json")).sort();

const readFile = (lang: string, file: string): Dict =>
  JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, lang, file), "utf8"));

const tokens = (text: string) => (text.match(/\{\{\s*\w+\s*\}\}|<\/?\w+\s*\/?>/g) ?? []).sort();

const baseFiles = listFiles(BASE);
const baseKeys = flatten(resources[BASE].translation as Dict);

describe("translation files", () => {
  it.each(supportedLanguages)("%s has the same files as English", (lang) => {
    expect(listFiles(lang)).toEqual(baseFiles);
  });

  describe.each(supportedLanguages.filter((l) => l !== BASE))("%s", (lang) => {
    it.each(baseFiles)("%s has exactly the same keys as English", (file) => {
      const expected = Object.keys(flatten(readFile(BASE, file)));
      const actual = Object.keys(flatten(readFile(lang, file)));
      const missing = expected.filter((k) => !actual.includes(k));
      const extra = actual.filter((k) => !expected.includes(k));
      expect({ missing, extra }, `${lang}/${file}`).toEqual({ missing: [], extra: [] });
    });

    it.each(baseFiles)("%s keeps every {{placeholder}} and <tag> from English", (file) => {
      const en = flatten(readFile(BASE, file));
      const translated = flatten(readFile(lang, file));
      const mismatched = Object.keys(en).filter(
        (k) => k in translated && tokens(en[k]).join() !== tokens(translated[k]).join(),
      );
      expect(mismatched, `${lang}/${file}`).toEqual([]);
    });
  });

  it.each(supportedLanguages)("%s has no empty texts", (lang) => {
    const empty = listFiles(lang).flatMap((file) =>
      Object.entries(flatten(readFile(lang, file)))
        .filter(([, value]) => value.trim() === "")
        .map(([key]) => `${file}: ${key}`),
    );
    expect(empty).toEqual([]);
  });

  it.each(supportedLanguages)("%s never defines the same section in two files", (lang) => {
    const owners = new Map<string, string>();
    const duplicates: string[] = [];
    for (const file of listFiles(lang)) {
      for (const section of Object.keys(readFile(lang, file))) {
        if (owners.has(section)) duplicates.push(`${section} (${owners.get(section)} and ${file})`);
        owners.set(section, file);
      }
    }
    expect(duplicates).toEqual([]);
  });
});

describe("code and translations", () => {
  const sourceFiles = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return ["ui", "i18n"].includes(entry.name) ? [] : sourceFiles(full);
      return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts") ? [full] : [];
    });

  const sections = new Set(Object.keys(resources[BASE].translation));

  it("every key used in the code exists in the dictionaries", () => {
    const missing: string[] = [];
    for (const file of sourceFiles(SRC_DIR)) {
      const source = fs.readFileSync(file, "utf8");
      // Static keys: t("section.key"), i18nKey="section.key", or keys passed as
      // plain strings (e.g. form error messages).
      for (const [, key] of source.matchAll(/["'`]([a-zA-Z]+\.[a-zA-Z0-9_.]+)["'`]/g)) {
        if (sections.has(key.split(".")[0]) && !(key in baseKeys)) {
          missing.push(`${path.relative(SRC_DIR, file)}: ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
