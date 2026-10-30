// Copies the calculator code and copy that the calculator-report Edge Function shares with the site
// into supabase/functions/_shared/, so the function never duplicates them by hand. The copies are
// byte-for-byte (src/lib/function-shared.test.ts fails when they drift). Run: npm run sync:function-shared
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "supabase/functions/_shared");

export const SHARED_FILES = [
  ["src/config/calculator.ts", "config/calculator.ts"],
  ["src/config/company.ts", "config/company.ts"],
  ["src/lib/calculator.ts", "lib/calculator.ts"],
  ...["en", "fr", "nl"].map((lang) => [
    `src/i18n/locales/${lang}/calculator.json`,
    `locales/${lang}/calculator.json`,
  ]),
];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [from, to] of SHARED_FILES) {
    mkdirSync(dirname(join(target, to)), { recursive: true });
    copyFileSync(join(root, from), join(target, to));
    console.log(`${from} -> supabase/functions/_shared/${to}`);
  }
}
