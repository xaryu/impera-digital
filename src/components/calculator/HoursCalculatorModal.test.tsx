// Drives the calculator the way a visitor does: open it from the strip, step
// through the four questions with the keyboard, read the estimate, close it
// with Escape.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const invoke = vi.fn().mockResolvedValue({ data: { ok: true }, error: null });
const insert = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: { invoke: (...args: unknown[]) => invoke(...args) },
    from: () => ({ insert: (...args: unknown[]) => Promise.resolve(insert(...args)) }),
  },
}));

import i18n from "@/i18n";
import CalculatorStrip from "@/components/sections/CalculatorStrip";

const renderStrip = async () => {
  await i18n.changeLanguage("en");
  return render(
    <MemoryRouter>
      <CalculatorStrip />
    </MemoryRouter>,
  );
};

const click = (element: HTMLElement) => fireEvent.click(element);
const type = (element: HTMLElement, value: string) => fireEvent.change(element, { target: { value } });

const openCalculator = async () => {
  const trigger = screen.getByRole("button", { name: /open the calculator/i });
  trigger.focus(); // a real browser focuses a button on mousedown; fireEvent does not
  click(trigger);
  return await screen.findByRole("dialog");
};

// Button names in either language, so the walkthrough helper works for both.
const NEXT = /^(next|volgende)$/i;
const SEE_RESULT = /see my estimate|toon mijn schatting/i;
const AUDIT = /get my growth audit|vraag mijn growth audit/i;

/** Clicks through to the estimate, leaving every answer at its default. */
const skipToResult = async (dialog: HTMLElement) => {
  for (let step = 0; step < 3; step += 1) {
    click(within(dialog).getByRole("button", { name: NEXT }));
  }
  click(within(dialog).getByRole("button", { name: SEE_RESULT }));
  await within(dialog).findByRole("button", { name: AUDIT });
};

describe("hours calculator", () => {
  beforeEach(() => {
    invoke.mockClear();
    insert.mockClear();
  });

  it("opens from the strip and shows the first of four steps", async () => {
    await renderStrip();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const dialog = await openCalculator();

    expect(within(dialog).getByText("Step 1 of 4")).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: /how many people do repetitive admin work/i })).toBeInTheDocument();
  });

  it("walks the four steps and shows an estimate from the entered figures", async () => {
    await renderStrip();
    const dialog = await openCalculator();

    // Step 1 — people. The slider starts at 3; two arrow presses make it 5.
    const people = within(dialog).getByRole("slider", { name: /how many people/i });
    fireEvent.keyDown(people, { key: "ArrowRight" });
    fireEvent.keyDown(people, { key: "ArrowRight" });
    expect(people).toHaveAttribute("aria-valuenow", "5");
    click(within(dialog).getByRole("button", { name: /^next$/i }));

    // Step 2 — hours each. Starts at 6, one press down makes it 5.
    expect(within(dialog).getByText("Step 2 of 4")).toBeInTheDocument();
    const hours = within(dialog).getByRole("slider", { name: /hours a week/i });
    fireEvent.keyDown(hours, { key: "ArrowLeft" });
    expect(hours).toHaveAttribute("aria-valuenow", "5");
    click(within(dialog).getByRole("button", { name: /^next$/i }));

    // Step 3 — hourly cost, pre-filled with the editable default.
    const cost = within(dialog).getByLabelText(/hourly cost in euros/i);
    expect(cost).toHaveValue("40");
    type(cost, "50");
    fireEvent.blur(cost);
    click(within(dialog).getByRole("button", { name: /^next$/i }));

    // Step 4 — tasks.
    expect(within(dialog).getByText("Step 4 of 4")).toBeInTheDocument();
    click(within(dialog).getByRole("checkbox", { name: /document processing/i }));
    click(within(dialog).getByRole("button", { name: /see my estimate/i }));

    // 5 people x 5 hours = 25 a week, x 46 weeks = 1,150 a year, x EUR 50.
    expect(within(dialog).getByText("25")).toBeInTheDocument();
    expect(within(dialog).getByText("1,150")).toBeInTheDocument();
    expect(within(dialog).getByText("€57,500")).toBeInTheDocument();

    // 30-60% of 1,150 hours, shown as a range alongside the assumptions.
    expect(within(dialog).getByText("345 – 690 hours a year")).toBeInTheDocument();
    expect(within(dialog).getByText(/€17,250 – €34,500/)).toBeInTheDocument();
    expect(within(dialog).getByText(/46 working weeks a year/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/this is an estimate/i)).toBeInTheDocument();

    // The audit CTA and the email offer both sit under the result.
    expect(within(dialog).getByRole("button", { name: /get my growth audit/i })).toBeInTheDocument();
    expect(within(dialog).getByRole("heading", { name: /want the breakdown/i })).toBeInTheDocument();
  });

  it("shows the result without asking for an email, and refuses to send without consent", async () => {
    await renderStrip();
    const dialog = await openCalculator();
    await skipToResult(dialog);

    // Nothing was sent to reach this point.
    expect(invoke).not.toHaveBeenCalled();

    type(within(dialog).getByLabelText(/work email/i), "someone@example.com");
    click(within(dialog).getByRole("button", { name: /send me the breakdown/i }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/tick the box/i);
    expect(invoke).not.toHaveBeenCalled();

    click(within(dialog).getByRole("checkbox", { name: /impera may email me/i }));
    click(within(dialog).getByRole("button", { name: /send me the breakdown/i }));

    expect(await within(dialog).findByText(/on its way/i)).toBeInTheDocument();
    expect(invoke).toHaveBeenCalledWith("send-calculator-report", {
      body: expect.objectContaining({
        email: "someone@example.com",
        consent: true,
        language: "en",
        inputs: { people: 3, hoursPerPersonPerWeek: 6, hourlyCost: 40, tasks: [] },
      }),
    });
  });

  it("rejects an invalid email before anything leaves the browser", async () => {
    await renderStrip();
    const dialog = await openCalculator();
    await skipToResult(dialog);

    type(within(dialog).getByLabelText(/work email/i), "not-an-email");
    click(within(dialog).getByRole("button", { name: /send me the breakdown/i }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/valid email/i);
    expect(invoke).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    await renderStrip();
    await openCalculator();

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // Focus goes back to the button that opened it.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /open the calculator/i })).toHaveFocus(),
    );
  });

  it("speaks Dutch when the site does", async () => {
    await i18n.changeLanguage("nl");
    render(
      <MemoryRouter>
        <CalculatorStrip />
      </MemoryRouter>,
    );

    const trigger = screen.getByRole("button", { name: /open de rekenmodule/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Stap 1 van 4")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("heading", { name: /hoeveel mensen doen repetitief administratief werk/i }),
    ).toBeInTheDocument();

    await skipToResult(dialog);
    expect(within(dialog).getByText(/46 werkweken per jaar/i)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /vraag mijn growth audit/i })).toBeInTheDocument();

    await i18n.changeLanguage("en");
  });

  it("records the funnel events", async () => {
    await renderStrip();
    const dialog = await openCalculator();
    await skipToResult(dialog);

    click(within(dialog).getByRole("button", { name: /get my growth audit/i }));

    const events = insert.mock.calls.map(([row]) => (row as { event: string }).event);
    expect(events).toContain("calculator_started");
    expect(events).toContain("calculator_finished");
    expect(events).toContain("calculator_audit_clicked");
  });
});
