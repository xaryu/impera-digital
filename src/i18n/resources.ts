// Loads every src/i18n/locales/<language>/<page>.json file and merges each
// language's files into one dictionary. Keys keep their full path
// (e.g. "hero.title1"), so which file a section lives in never matters to the code.

export const supportedLanguages = ["en", "fr", "nl"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export type Dictionary = Record<string, unknown>;

const files = import.meta.glob<Dictionary>("./locales/*/*.json", { eager: true, import: "default" });

const buildResources = () => {
  const resources = Object.fromEntries(
    supportedLanguages.map((lang) => [lang, { translation: {} as Dictionary }]),
  ) as Record<SupportedLanguage, { translation: Dictionary }>;

  for (const [filePath, content] of Object.entries(files)) {
    const lang = filePath.split("/")[2] as SupportedLanguage;
    if (!resources[lang]) continue;
    Object.assign(resources[lang].translation, content);
  }
  return resources;
};

export const resources = buildResources();
