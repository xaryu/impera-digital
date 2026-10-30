import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18n from "@/i18n";
import { supabase } from "@/integrations/supabase/client";
import CalculatorConfirm from "./CalculatorConfirm";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

// Navbar and Footer pull in the whole site chrome, which this page test does not need.
vi.mock("@/components/layout/Navbar", () => ({ default: () => null }));
vi.mock("@/components/layout/Footer", () => ({ default: () => null }));

const TOKEN = "a".repeat(43);

const renderPage = (search = `?token=${TOKEN}`) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/calculator/confirm${search}`]}>
        <CalculatorConfirm />
      </MemoryRouter>
    </HelmetProvider>,
  );

const press = () => fireEvent.click(screen.getByRole("button", { name: "Send me my report" }));

const httpError = (status: number) => ({ context: { status } });

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.mocked(supabase.functions.invoke).mockReset();
});

afterEach(cleanup);

describe("CalculatorConfirm", () => {
  it("sends nothing until the button is pressed", () => {
    renderPage();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Send me my report" })).toBeInTheDocument();
  });

  it("posts the token and shows the success message", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: { ok: true }, error: null });
    renderPage();
    press();
    await waitFor(() => expect(screen.getByText(/Your report is on its way/)).toBeInTheDocument());
    expect(supabase.functions.invoke).toHaveBeenCalledWith("calculator-report", {
      body: { action: "confirm", token: TOKEN },
    });
    expect(screen.queryByRole("button", { name: "Send me my report" })).not.toBeInTheDocument();
  });

  it("says so when the report was already sent", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: { ok: true, already_sent: true }, error: null });
    renderPage();
    press();
    await waitFor(() => expect(screen.getByText(/already sent/)).toBeInTheDocument());
  });

  it.each([
    [404, /not valid/],
    [410, /expired/],
    [409, /being sent/],
  ])("maps a %i answer to its message", async (status, text) => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: null, error: httpError(status) });
    renderPage();
    press();
    await waitFor(() => expect(screen.getByText(text)).toBeInTheDocument());
  });

  it("keeps the button for a retry after a send failure", async () => {
    vi.mocked(supabase.functions.invoke).mockResolvedValue({ data: null, error: httpError(502) });
    renderPage();
    press();
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/could not send/));
    expect(screen.getByRole("button", { name: "Send me my report" })).toBeEnabled();
  });

  it("shows the invalid message without a token and never calls the function", () => {
    renderPage("");
    expect(screen.getByText(/not valid/)).toBeInTheDocument();
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
  });
});
