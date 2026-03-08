const STORAGE_KEY = "impera_cookie_consent";

export type CookiePreferences = {
  necessary: true; // always true
  analytics: boolean;
  marketing: boolean;
  consentedAt: string;
};

export const getConsent = (): CookiePreferences | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePreferences;
  } catch {
    return null;
  }
};

export const saveConsent = (prefs: Omit<CookiePreferences, "necessary" | "consentedAt">) => {
  const consent: CookiePreferences = {
    necessary: true,
    analytics: prefs.analytics,
    marketing: prefs.marketing,
    consentedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));
  return consent;
};

export const clearConsent = () => {
  localStorage.removeItem(STORAGE_KEY);
};
