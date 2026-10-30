import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import "@/i18n";
import EmailStep from "./EmailStep";

describe("EmailStep", () => {
  it("renders the privacy link text inside the consent label", () => {
    render(
      <MemoryRouter>
        <EmailStep
          email=""
          consent={false}
          website=""
          error={null}
          onEmailChange={() => {}}
          onConsentChange={() => {}}
          onWebsiteChange={() => {}}
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: "Privacy Policy" });
    expect(link.getAttribute("href")).toBe("/privacy");
  });
});
