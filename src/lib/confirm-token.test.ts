import { afterEach, describe, expect, it } from "vitest";
import { captureConfirmToken, getConfirmToken, resetConfirmToken } from "./confirm-token";

const TOKEN = "a".repeat(43);

afterEach(() => {
  resetConfirmToken();
  window.history.replaceState(null, "", "/");
});

describe("confirm token", () => {
  it("takes the token out of the URL so analytics never see it, and keeps it for the page", () => {
    window.history.replaceState(null, "", `/fr/calculator/confirm?token=${TOKEN}&utm_source=mail#x`);
    captureConfirmToken();
    expect(window.location.pathname + window.location.search + window.location.hash).toBe(
      "/fr/calculator/confirm?utm_source=mail#x",
    );
    expect(getConfirmToken(null)).toBe(TOKEN);
  });

  it("survives a reload in the same tab (sessionStorage)", () => {
    window.history.replaceState(null, "", `/calculator/confirm?token=${TOKEN}`);
    captureConfirmToken();
    expect(sessionStorage.getItem("impera_calculator_confirm_token")).toBe(TOKEN);
  });

  it("leaves other pages alone", () => {
    window.history.replaceState(null, "", "/blog?token=abc");
    captureConfirmToken();
    expect(window.location.search).toBe("?token=abc");
    expect(getConfirmToken(null)).toBeNull();
  });

  it("prefers a token still in the URL", () => {
    expect(getConfirmToken("b".repeat(43))).toBe("b".repeat(43));
  });
});
