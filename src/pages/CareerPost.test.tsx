import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CareerPost from "./CareerPost";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const JOB_ID = "11111111-2222-3333-4444-555555555555";
const job = {
  id: JOB_ID,
  slug: "designer",
  title: "Designer",
  department: "Design",
  location: "Leuven",
  type: "Full-time",
  short_description: "Join us",
  full_description: "Join us",
  requirements: "- Taste",
  benefits: "- Coffee",
  published: true,
};

const upload = vi.fn();
vi.mock("@/integrations/supabase/client", () => {
  const query = { select: () => query, eq: () => query, single: async () => ({ data: job, error: null }) };
  return {
    supabase: {
      from: () => query,
      storage: { from: () => ({ upload: (...args: unknown[]) => upload(...args) }) },
      functions: { invoke: vi.fn() },
    },
  };
});
vi.mock("@/components/layout/Navbar", () => ({ default: () => null }));
vi.mock("@/components/layout/Footer", () => ({ default: () => null }));
vi.mock("@/components/layout/SEO", () => ({ default: () => null }));

const renderPage = () =>
  render(
    <HelmetProvider>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter initialEntries={["/careers/designer"]}>
          <Routes>
            <Route path="/careers/:slug" element={<CareerPost />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </HelmetProvider>,
  );

const fill = (email = "helene@example.com") => {
  fireEvent.change(document.getElementById("apply-name")!, { target: { value: "Hélène O'Brien-Ștefan" } });
  fireEvent.change(document.getElementById("apply-email")!, { target: { value: email } });
  fireEvent.change(document.getElementById("apply-motivation")!, { target: { value: "Hello" } });
};
const submit = () => fireEvent.submit(document.getElementById("apply-name")!.closest("form")!);

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.mocked(toast.error).mockReset();
  upload.mockReset().mockResolvedValue({ data: {}, error: null });
  vi.mocked(supabase.functions.invoke).mockReset().mockResolvedValue({ data: { ok: true }, error: null } as never);
});

afterEach(cleanup);

describe("CareerPost application", () => {
  it("uploads the CV under a random name, never the applicant's, and submits through form-submit", async () => {
    renderPage();
    await screen.findByText("Designer", { selector: "h1" });
    fill();
    const file = new File(["%PDF"], "CV Hélène.PDF", { type: "application/pdf" });
    fireEvent.change(document.getElementById("apply-cv")!, { target: { files: [file] } });
    submit();

    await waitFor(() => expect(supabase.functions.invoke).toHaveBeenCalled());
    const path = upload.mock.calls[0][0] as string;
    expect(path).toMatch(new RegExp(`^${JOB_ID}/[0-9a-f-]{36}\\.pdf$`));
    expect(supabase.functions.invoke).toHaveBeenCalledWith("form-submit", {
      body: {
        kind: "application",
        jobId: JOB_ID,
        fullName: "Hélène O'Brien-Ștefan",
        email: "helene@example.com",
        motivation: "Hello",
        cvPath: path,
        website: "",
      },
    });
    // The file input is cleared, so the same file can be picked again.
    await waitFor(() => expect((document.getElementById("apply-cv") as HTMLInputElement).value).toBe(""));
  });

  it("rejects an invalid email before sending anything", async () => {
    renderPage();
    await screen.findByText("Designer", { selector: "h1" });
    fill("not-an-email");
    submit();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Please enter a valid email address"));
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });

  it("refuses a CV that is not PDF/DOC/DOCX", async () => {
    renderPage();
    await screen.findByText("Designer", { selector: "h1" });
    const file = new File(["x"], "cv.exe", { type: "application/octet-stream" });
    fireEvent.change(document.getElementById("apply-cv")!, { target: { files: [file] } });
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Please upload a PDF, DOC or DOCX file"));
    expect((document.getElementById("apply-cv") as HTMLInputElement).value).toBe("");
  });
});
