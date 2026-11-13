import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { submitForm } from "./submit-form";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

const lead = { kind: "lead", email: "a@b.co", source: "exit_intent", website: "" } as const;
const httpError = (status: number) => ({ data: null, error: { context: { status } } });

beforeEach(() => vi.mocked(supabase.functions.invoke).mockReset());

describe("submitForm", () => {
  it("posts to form-submit and returns null on success", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: { ok: true }, error: null } as never);
    expect(await submitForm(lead)).toBeNull();
    expect(supabase.functions.invoke).toHaveBeenCalledWith("form-submit", { body: lead });
  });

  it.each([429, 503])("maps %i to the rate-limit message", async (status) => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue(httpError(status) as never);
    expect(await submitForm(lead)).toBe("common.rateLimited");
  });

  it("maps anything else to the generic error", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue(httpError(500) as never);
    expect(await submitForm(lead)).toBe("common.genericError");
  });
});
