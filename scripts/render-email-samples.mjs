// Renders the calculator emails to HTML files for review before deploying: the smallest, default and
// largest inputs in every language, plus the confirmation email. Open the files in a browser.
// Run: npm run render:email-samples   (writes to email-samples/, which git ignores)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "email-samples");

// Vite loads the TypeScript template with the project's "@/" alias, so no extra tooling is needed.
const vite = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });

try {
  const { buildConfirmationEmail, buildReportEmail } = await vite.ssrLoadModule(
    "/supabase/functions/calculator-report/email.ts",
  );
  const { calculatorTaskIds } = await vite.ssrLoadModule("/src/config/calculator.ts");

  const samples = {
    smallest: { people: 1, hoursPerPerson: 1, hourlyCost: 10, tasks: ["followUps"] },
    default: { people: 3, hoursPerPerson: 5, hourlyCost: 40, tasks: ["documents", "dataEntry", "quotes"] },
    largest: { people: 50, hoursPerPerson: 20, hourlyCost: 500, tasks: [...calculatorTaskIds] },
  };

  mkdirSync(output, { recursive: true });
  for (const language of ["en", "fr", "nl"]) {
    for (const [name, inputs] of Object.entries(samples)) {
      writeFileSync(join(output, `report-${name}-${language}.html`), buildReportEmail(inputs, language).html);
    }
    const confirmation = buildConfirmationEmail(language, "https://impera.digital/calculator/confirm?token=sample");
    writeFileSync(join(output, `confirm-${language}.html`), confirmation.html);
  }
  console.log(`Wrote 12 samples to ${output}`);
} finally {
  await vite.close();
}
