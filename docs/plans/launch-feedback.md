# Launch feedback (2026-11-06)

Final round of feedback before launch. Six requests, grouped into three phases. Each phase can ship
on its own. Work on branch `feature/launch-feedback`, one commit per item.

| # | Request | Phase | Size | Deploy |
| - | ------- | ----- | ---- | ------ |
| 1 | Move the calculator strip below the pain points | A | S | Vercel |
| 2 | Six pain-point cards, with icons that match the text | A | M | Vercel |
| 3 | Every "Book my audit" CTA goes to the calendar | B | S | Vercel |
| 4 | Open Calendly in a new tab, not a modal | B | S | Vercel |
| 5 | Same colors as the site in both emails | C | S | Edge Function |
| 6 | A visual report with charts | C | L | Edge Function |

No database migrations in any phase.

## Decisions (made 2026-11-06)

| # | Question | Decision |
| - | -------- | -------- |
| D1 | Copy for the two new cards | Use the drafts in A2. Claude drafts NL/FR for all six cards and the audit button labels; Paul checks them |
| D2 | How to build the charts | Option 1 in C2: HTML table charts inside the email |
| D3 | Where did the reviewer see black? | Screenshot received 2026-11-07: looks like the Gmail app in dark mode, which recolors the whole email and ignores `color-scheme`. Every fill and text color now also uses the forms Gmail is reported to leave alone (`solid`, `ink` in `email.ts`). Not confirmed until tested in the Gmail app in dark mode, iOS and Android |
| D4 | Methodology "Start Your 90-Day Transformation" | Goes to the calendar, label unchanged |
| D5 | "Services of Distinction" / "What We Do" heading | Kept at first; **superseded 2026-11-13**: the homepage section is now "Sound Familiar?" / "The Hidden Cost of Standing Still" (see "Follow-up feedback" below). The Services page keeps its own heading |

## Phase A: homepage

### A1. Move the strip

In `src/pages/Index.tsx`, move `<HoursCalculatorStrip />` to just after `<ServicesSection />`.

The strip (`bg-navy`) will now sit directly above `ResultsSection`, whose gradient also starts at
navy, so the two will merge into one block. Add a thin gold divider or adjust the background after
checking it in the browser.

### A2. Six cards

**The NL and FR cards were never updated.** They still show the old services pitch ("Merkidentiteit",
"Identité de Marque"). The dictionary test only checks that keys exist, so it didn't catch this. All
six cards need new NL and FR text, not just the two new ones.

Draft copy for the new cards (EN):

| Title | Text |
| ----- | ---- |
| Leads go cold | Every enquiry waits for someone to get to it. By the time they do, the prospect has already signed with whoever answered first. |
| Knowledge in one head | Key processes live in one person's memory. When they're away, the work stops, and when they leave, it goes with them. |

Icons (all available in the installed `lucide-react`):

| Card | Now | New |
| ---- | --- | --- |
| Senior time wasted | Palette | `Hourglass` |
| Systems that don't talk | Globe | `Unplug` |
| Decisions arrive late | Megaphone | `History` |
| Growth multiplies the mess | TrendingUp | `Layers` |
| Leads go cold | new | `PhoneMissed` |
| Knowledge in one head | new | `UserX` |

Changes:

- `src/components/sections/ServicesSection.tsx`: icons, two more cards, grid to
  `md:grid-cols-2 lg:grid-cols-3`.
- Rename the keys to match the content (`brandIdentity` → `seniorTime`, and so on) in
  `src/i18n/locales/{en,nl,fr}/home.json`. Check that nothing else uses the old keys first.
- Fix the reveal timing. The delay is `index * 550ms`, so the sixth card would wait 2.75s. Base it on
  the card's column, so it stays short on mobile too. The `rootMargin` also grows with the index and
  needs rechecking, or the last cards may never trigger on short screens.

## Phase B: booking

### B1. Which CTAs change

The labels differ per language (NL Guarantee button: "Controleer Uw Geschiktheid"), so this list goes
by location.

| Location | Now | After |
| -------- | --- | ----- |
| `HeroSection.tsx` | modal | new tab |
| `CTASection.tsx` | modal | new tab |
| `Services.tsx` "Book free call" | modal | new tab |
| `ResultView.tsx`, `DoneView.tsx` (calculator) | modal | new tab, keeps `audit_clicked` |
| `GuaranteeSection.tsx` | **`/contact`** | new tab |
| `About.tsx` | **`/contact`** | new tab |
| `Methodology.tsx` | `/contact` | new tab |
| Services page "Get in Touch", Products CTAs | `/contact`, `/services` | unchanged, not audit CTAs |

The NL and FR labels for the Guarantee and final CTA buttons should also say "audit", to match the
hero and the EN text. Include these in D1.

### B2. Replace the modal

- Add `src/components/common/BookingLink.tsx`: an `<a>` to `company.calendlyUrl` with
  `target="_blank" rel="noopener noreferrer"`, taking `className`, `children` and `onClick`. Add
  screen-reader text for "opens in a new tab" (new `common` key in all languages).
- A plain link rather than `window.open`, so popup blockers don't interfere.
- Delete `CalendlyDialog.tsx` and the `calendly.*` keys in `common.json`.
- `legal.json` (all languages): replace "integrated Calendly widget", since there is no longer an
  embed.
- Update `HoursCalculatorModal.test.tsx`: the audit control is now a link (lines 117, 185, 235).
- Update the "Modals" line in `CLAUDE.md`.

The calculator modal stays open behind the new tab, so visitors keep their result when they return.

## Phase C: emails

### C1. Colors

The email hardcodes colors that aren't the site's:

| | Email now | Site |
| - | --------- | ---- |
| Gold | `#c9a24a` | `#d4ad49` |
| Navy | `#0f1b33` | `#1d3b5d` (navy), `#0f1c2f` (navy-dark) |
| Background | `#f6f1e7` | `#faf8f5` (cream) |

Add the site's values as hex in one place, `src/config/email-theme.ts`, include it in `SHARED_FILES`,
and add a test that compares them with the variables in `src/index.css` so they can't drift.

**The black button isn't explained by the code.** The confirmation button is already gold with
near-black navy text, and the confirm page button is gold too. The likely causes are the dark text
being read as black, or a mail app's dark mode changing the colors. Add
`<meta name="color-scheme" content="light only">` and test in Gmail dark mode, but ask the reviewer
which mail app they used and for a screenshot (D3), or we can't confirm it's fixed.

Gold text on white is hard to read (about 2:1), so gold is used only on navy or as a fill.

### C2. Visual report

**Charts must not imply data we don't have.** Hours are split evenly across tasks, so a chart of
hours per task would be equal bars. The charts below use only figures we already calculate. Plan D5
still holds: no invented numbers.

Report layout (600px, table-based):

1. **Navy header**: Impera wordmark, then the yearly cost as the headline number.
2. **Three stat tiles**: hours per week, hours per year, cost per year.
3. **Chart: what can be recovered.** One bar of the yearly cost, split into 30% likely, 30–60%
   possible and the rest. Euro values in the legend.
4. **Chart: cost of waiting.** Bars for 1, 3 and 5 years at today's figures, labelled as such.
5. **Chart: hours by automation fit.** High versus medium, the one split that is meaningful.
6. **Task cards** with fit badges, and "automate first" as a highlighted callout.
7. **Not worth automating yet**, then assumptions and disclaimer in small print.
8. **Navy closing band** with the audit button.

Options for D2:

| Option | Result | Cost and risk |
| ------ | ------ | ------------- |
| **1. HTML table charts (recommended)** | Bars and tiles. Shows with images blocked, in every client | No donut or line charts. Keeps the "no images" rule |
| 2. PNG charts, embedded in the email | Any chart style | Image rendering in the Edge Function, can be blocked by mail apps, needs alt text |
| 3. PDF attachment | Most impressive, easy to forward | Largest build, heavier function, more spam risk |
| 4. Web report page linked from the email | Full interactive charts | Stored report behind a token, retention rules, `legal.json` update |

SVG isn't an option: Gmail and Outlook don't display it. Option 1 can later be extended with option
3 or 4 if the report needs more.

Changes:

- `src/lib/calculator.ts`: add the chart figures (cost over 1/3/5 years, hours by fit) with unit tests.
- `src/config/calculator.ts`: the year steps.
- `supabase/functions/calculator-report/email.ts`: small helpers (`statTile`, `barChart`,
  `stackedBar`), rewrite `buildReportEmail`, apply the same header to `buildConfirmationEmail`.
- `src/i18n/locales/{en,nl,fr}/calculator.json`: new `calculator.report.*` text, then
  `npm run sync:function-shared`.
- Add a script that renders sample reports to HTML (smallest, default and largest inputs, in all
  three languages). The largest input is about €23M a year, so the tiles must fit that.
- Add tests: all languages render, no `undefined` or leftover `{{`, values are escaped, and HTML stays
  under 100 KB because Gmail clips messages above 102 KB.

## Verification

- **Each phase**: `npm test`, `npm run lint`, `npm run build`.
- **A and B**: browser check in EN/NL/FR at 360/768/1440 px. Click every CTA in the B1 table and
  confirm the calendar opens in a new tab. Confirm that `audit_clicked` is still recorded.
- **C**: review the rendered samples before deploying. Then send a test to Paul's inbox and check
  Gmail web, Gmail mobile (light and dark), Apple Mail and Outlook. Finish with one real submission
  through modal → confirmation email → confirm page → report, using an address outside the dedupe
  window.

## Release

1. Phases A and B: merge to `main`, Vercel deploys.
2. Phase C: run the sync, merge, then
   `npx supabase functions deploy calculator-report --project-ref hcotcpkpxcheeptejmum`.
3. Update "Active work" in `CLAUDE.md`.

## Still open from before launch

Not part of this feedback, but relevant to the launch decision:

- `contact@` and `careers@impera.digital` still bounce: the domain had no MX records at last check
  (2026-10-30), and the site shows these addresses.
- `X-Forwarded-For` rate-limit test.
- VoiceOver and real-phone keyboard tests.

## Follow-up feedback (2026-11-13)

Branch `feature/footer-homepage-copy`. Vercel only: no migrations, and the Edge Function doesn't use
the address, so no function deploy (`_shared/config/company.ts` was synced anyway for the drift test).

| # | Request | Done |
| - | ------- | ---- |
| F1 | Remove "Digital Media Agency" above the hero title | `hero.eyebrow` deleted (all languages), animation delays moved up 0.2s. Same wording also removed from the meta/OG descriptions (`index.html`, `homePage.seoDescription`, `SEO.tsx` default and JSON-LD) |
| F2 | Homepage pain-points heading | "Sound Familiar?" / "The Hidden Cost of Standing Still"; FR "Ça vous parle ?" / "Le Coût Caché de l'Immobilisme"; NL "Klinkt Bekend?" / "De Verborgen Kosten van Stilstand" |
| F3 | Footer description | "Growth strategy and AI automation for ambitious businesses. Senior specialists only." (+ FR/NL) |
| F4 | Footer services = the Services page list, each scrolling to its section | One list in `src/config/services.ts` used by the Services page, the footer and the JSON-LD offer catalog. Anchors `/services#ai-automation`, `#web-development`, `#digital-marketing`, `#growth-strategy`; `ScrollOnNavigate` (`src/hooks/use-scroll-on-navigate.ts`, App-level) handles all scrolling on navigation: top of page, anchor (top if missing), nothing on back/forward or language switch; `LocalizedLink` no longer scrolls itself. Language switch keeps `#anchor`. AI service keys renamed `brandIdentity*`/`brandD*` → `aiAutomation*`/`aiD*`. Tests in `Footer.test.tsx` and `src/config/services.test.ts` (service keys exist in every language) |
| F5 | Address: Groenstraat 80, 3001 Heverlee | `src/config/company.ts` (footer, contact page, legal pages, JSON-LD) |
| F6 | Footer button "Start Your Project" → "Get in Touch" | `footer.getInTouch`: FR "Nous Contacter", NL "Neem Contact Op" (NL nav says "Contact", which would repeat the heading) |

Found on the way: FR/NL service 1 on the Services page was still "Identité de Marque"/"Merkidentiteit"
(EN changed to AI automation in `e2263e2` without FR/NL), which would have shown in the footer. Now
translated (Paul to check). EN typos fixed there ("handeled", "Documating"). Still open, not in this
feedback: the FR/NL About page has the same gap (`about.json` changed in EN only in `e2263e2`), and
the team `Person` JSON-LD in `SEO.tsx` doesn't match the About page's three specialists.
