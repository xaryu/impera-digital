import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { act, cleanup, render, screen } from "@testing-library/react";
import "@/i18n";
import { clearConsent } from "@/lib/cookie-consent";
import CookieConsent from "./CookieConsent";

describe("CookieConsent", () => {
  beforeEach(() => {
    clearConsent();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.querySelectorAll("[data-test-dialog]").forEach((el) => el.remove());
  });

  it("waits until an open modal is closed", async () => {
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("data-test-dialog", "");
    document.body.appendChild(dialog);

    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.queryByRole("button", { name: "Accept All" })).toBeNull();

    await act(async () => {
      dialog.remove();
    });
    expect(screen.getByRole("button", { name: "Accept All" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toBeTruthy();
  });
});
