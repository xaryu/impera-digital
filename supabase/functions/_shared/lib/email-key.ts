// Collapses the spellings of one mailbox into a single dedupe key, so the calculator's "one report
// per address per 10 minutes" rule cannot be dodged with a+1@x.com, a+2@x.com or a.b@gmail.com.
// Only the key is normalised; the report is still mailed to the address the visitor typed.
// Shared with the calculator-report Edge Function (npm run sync:function-shared).
export const emailKey = (email: string): string => {
  const [rawLocal, rawDomain = ""] = email.trim().toLowerCase().split("@");
  const domain = rawDomain === "googlemail.com" ? "gmail.com" : rawDomain;
  const local = rawLocal.split("+")[0];
  // Gmail ignores dots in the local part; other providers may not, so only strip them there.
  return `${domain === "gmail.com" ? local.replace(/\./g, "") : local}@${domain}`;
};
