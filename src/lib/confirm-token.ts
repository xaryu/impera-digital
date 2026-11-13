// The calculator confirmation link carries a one-time token in its query string
// (/calculator/confirm?token=...). Analytics (GA4 page_location, Meta PageView) record the full URL,
// so the token is taken out of the address bar before React or any tracking script runs.
// Kept in sessionStorage so a reload of the page in the same tab still works.

const STORAGE_KEY = "impera_calculator_confirm_token";
const CONFIRM_PATH = /\/calculator\/confirm\/?$/;

let captured: string | null = null;

// Call once, before rendering the app (main.tsx).
export const captureConfirmToken = (win: Window = window) => {
  const url = new URL(win.location.href);
  const token = url.searchParams.get("token");
  if (!token || !CONFIRM_PATH.test(url.pathname)) return;
  captured = token;
  try {
    win.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage blocked: the in-memory copy still covers this page load.
  }
  url.searchParams.delete("token");
  win.history.replaceState(win.history.state, "", `${url.pathname}${url.search}${url.hash}`);
};

// The token for the confirm page: the one in the URL if there still is one (tests, or capture not
// run), else the captured one.
export const getConfirmToken = (fromUrl: string | null): string | null => {
  if (fromUrl) return fromUrl;
  if (captured) return captured;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

// Test helper.
export const resetConfirmToken = () => {
  captured = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
