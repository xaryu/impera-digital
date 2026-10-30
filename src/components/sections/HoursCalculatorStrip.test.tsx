import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18n from "@/i18n";
import HoursCalculatorStrip from "./HoursCalculatorStrip";

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

afterEach(cleanup);

describe("HoursCalculatorStrip", () => {
  it("opens the calculator from the button and returns focus to it on Escape", async () => {
    render(<HoursCalculatorStrip />);
    const button = screen.getByRole("button", { name: "Calculate my hours" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    button.focus();
    fireEvent.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Radix hands focus back in a timeout after the content unmounts.
    await waitFor(() => expect(button).toHaveFocus());
  });

  it("closes from the X button, which has a translated label", () => {
    render(<HoursCalculatorStrip />);
    fireEvent.click(screen.getByRole("button", { name: "Calculate my hours" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the Dutch strip and X label in Dutch", async () => {
    await i18n.changeLanguage("nl");
    render(<HoursCalculatorStrip />);
    fireEvent.click(screen.getByRole("button", { name: "Bereken mijn uren" }));
    expect(screen.getByRole("button", { name: "Sluiten" })).toBeInTheDocument();
    await i18n.changeLanguage("en");
  });
});
