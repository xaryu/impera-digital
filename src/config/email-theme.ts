// The site's brand colors as hex, for the calculator emails: mail clients don't reliably read the
// hsl() values in src/index.css. email-theme.test.ts fails when the two drift apart.
//
// Gold on white is hard to read (about 2:1), so in emails gold is used only on navy or as a fill.
export const emailTheme = {
  navy: "#1d3b5d",
  navyDark: "#0f1c2f",
  gold: "#d4ad49",
  cream: "#faf8f5",
} as const;
