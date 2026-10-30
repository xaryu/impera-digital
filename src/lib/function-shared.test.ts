// Fails when the copies under supabase/functions/_shared/ no longer match the site's files.
// Fix: npm run sync:function-shared
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SHARED_FILES } from "../../scripts/sync-function-shared.mjs";

const root = join(__dirname, "../..");

describe("Edge Function shared files", () => {
  it.each(SHARED_FILES)("%s is in sync", (from, to) => {
    const copy = readFileSync(join(root, "supabase/functions/_shared", to), "utf8");
    expect(copy).toBe(readFileSync(join(root, from), "utf8"));
  });
});
