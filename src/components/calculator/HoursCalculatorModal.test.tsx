import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import i18n from "@/i18n";
import HoursCalculatorModal from "./HoursCalculatorModal";

const Harness = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen(true)}>reopen</button>
      <HoursCalculatorModal open={open} onOpenChange={setOpen} />
    </>
  );
};

const next = () => fireEvent.click(screen.getByRole("button", { name: /^(Next|See my estimate)$/ }));

const setNumber = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label, { selector: "input" }), { target: { value } });

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

afterEach(cleanup);

describe("HoursCalculatorModal", () => {
  it("opens on the first question with progress and a labelled dialog", () => {
    render(<Harness />);
    expect(screen.getByRole("dialog", { name: "How many hours is your team losing?" })).toBeInTheDocument();
    expect(screen.getByText("How many people do repetitive admin work?")).toBeInTheDocument();
    expect(screen.getAllByText("Step 1 of 4").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
  });

  it("moves focus to the question on each step", () => {
    render(<Harness />);
    expect(document.activeElement).toHaveTextContent("How many people do repetitive admin work?");
    next();
    expect(document.activeElement).toHaveTextContent("How many hours a week does each of them spend on it?");
  });

  it("blocks Next on invalid input and shows a message", () => {
    render(<Harness />);
    setNumber("Number of people", "0");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a whole number between 1 and 50");

    setNumber("Number of people", "51");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    setNumber("Number of people", "");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();

    setNumber("Number of people", "50");
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("fills the default hourly cost into the help text", () => {
    render(<Harness />);
    next();
    next();
    expect(screen.getByText(/Change it if 40 is not right/)).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent("{{");
  });

  it("needs at least one task before showing the result", () => {
    render(<Harness />);
    next();
    next();
    next();
    expect(screen.getByRole("group")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "See my estimate" })).toBeDisabled();

    fireEvent.click(screen.getByLabelText("Invoicing"));
    expect(screen.getByRole("button", { name: "See my estimate" })).toBeEnabled();

    fireEvent.click(screen.getByLabelText("Invoicing"));
    expect(screen.getByRole("alert")).toHaveTextContent("Pick at least one task");
    expect(screen.getByRole("button", { name: "See my estimate" })).toBeDisabled();
  });

  it("shows the worked example without asking for an email", () => {
    render(<Harness />);
    next(); // 3 people
    next(); // 5 hours
    next(); // 40 euro
    fireEvent.click(screen.getByLabelText("Document processing"));
    next();

    expect(screen.getByText("Hours lost per week").nextSibling).toHaveTextContent("15");
    expect(screen.getByText("Hours lost per year").nextSibling).toHaveTextContent("690");
    expect(screen.getByText("What that costs per year").nextSibling).toHaveTextContent("27,600");
    expect(screen.getByText(/207 – 414 hours a year/)).toBeInTheDocument();
    expect(screen.getByText(/8,280.*16,560 a year/)).toBeInTheDocument();
    expect(screen.getByText(/This is an estimate/)).toBeInTheDocument();
    expect(screen.getByText("Assumptions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Get My Growth Audit" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
  });

  it("keeps the inputs when going back", () => {
    render(<Harness />);
    setNumber("Number of people", "7");
    next();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Number of people", { selector: "input" })).toHaveValue(7);
  });

  it("closes on Escape and keeps the inputs when reopened", () => {
    render(<Harness />);
    setNumber("Number of people", "9");
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("reopen"));
    expect(screen.getByLabelText("Number of people", { selector: "input" })).toHaveValue(9);
  });

  it("starts over from the result", () => {
    render(<Harness />);
    setNumber("Number of people", "9");
    next();
    next();
    next();
    fireEvent.click(screen.getByLabelText("Quotes"));
    next();
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(screen.getByLabelText("Number of people", { selector: "input" })).toHaveValue(3);
  });
});

