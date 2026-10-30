# Plan: "How many hours is your team losing?" calculator

Status: **planned, decisions confirmed, not started** · Owner: Paul · Written: 2026-10-30

Retention: delete `calculator_submissions` rows older than 24 months. Add a `pg_cron` job in the
migration (`DELETE … WHERE created_at < now() - interval '24 months'`, run daily). Events contain
no personal data and can be kept.

## 1. Goal

A short, honest calculator on the homepage. It shows a visitor how many admin hours their team
loses each year and what that costs. It turns that into an optional email report and a
"Get My Growth Audit" booking. The result is shown **without** asking for an email. The email is
only for the detailed breakdown.

Success = visitors finish the calculator, some request the report, and some click the audit.
The four tracked events (§7) measure this funnel.

## 2. Decisions about the brief (read first)

The brief doesn't match the codebase in a few places. These are the decisions taken. Paul
confirmed all of them on 2026-10-30.

| # | Brief says | Reality in the repo | Decision |
|---|---|---|---|
| D1 | "after the pain-points section" | The homepage has no pain-points section (order: Hero, Services, Results, Pathway, WhyImpera, FAQ, About, Guarantee, CTA) | Put the strip **right after `HeroSection`, before `ServicesSection`** (confirmed) |
| D2 | "Keep all copy in the existing lib/config file" | There's no copy in `lib/` or `config/`. All copy lives in `src/i18n/locales/<lang>/*.json` (editable by non-devs, checked by `npm run check:texts`). `src/config/company.ts` holds facts, not copy | **Copy** goes in a new `calculator.json` per language. **Numbers and assumptions** (46 weeks, 30–60%, default €40, input limits, task fit) go in `src/config/calculator.ts`. Both can be edited in one place each |
| D3 | "EN and NL versions" | The site also ships FR, and `dictionaries.test.ts` fails the build-time check if `fr/calculator.json` is missing or has different keys | Write EN + NL properly. `fr/calculator.json` holds **the English text for now**, like `legal.json` does today (confirmed). The FR strip still shows. The FR report email also goes out in English until it's translated. Add a note to `src/i18n/locales/README.md` |
| D4 | "trigger the report email" | No email provider and no Edge Functions exist yet | Add a Supabase Edge Function plus **Resend** (confirmed). Needs a verified sending domain (`impera-group.com`) and a `RESEND_API_KEY` secret. Default sender is `Impera <report@impera-group.com>`. Paul can change it in the `REPORT_FROM` secret |
| D5 | "tasks ranked by likely time saved" | We don't know how a visitor's hours split across tasks, and we have no data on savings per task | No invented numbers. The ranking uses a **qualitative "automation fit"** per task (high / medium). This is Impera's own judgement, stored in config and labelled as such in the report. The per-task hours are an **even split** of the stated hours across the selected tasks, and the report says so. The fit table in §5.3 is confirmed |
| D6 | "Get My Growth Audit" button | Recent commit routes audit CTAs to `CalendlyDialog` | The button opens the existing `CalendlyDialog` (nested Radix dialog) |
| D7 | Event tracking | GA4 is wired but still has a placeholder ID and only loads with analytics consent | Use a first-party Supabase table with **no personal data and no cookies or storage** (id held in memory per modal open), so no consent is needed. Also mirror to `gtag` when it's present |
| D8 | Privacy | The privacy policy doesn't mention calculator data or an email provider | Update `legal.json` (all 3 languages): data collected, purpose, retention, Resend as processor. This is required before launch, not optional |

## 3. User flow

```
Homepage strip ──[Calculate my hours]──► Modal
  Step 1/4  People doing repetitive admin        (1–50)
  Step 2/4  Hours per person per week            (1–20)
  Step 3/4  Average hourly cost (€)              (default 40, editable)
  Step 4/4  Which tasks? (multi-select, ≥1)      6 options
  ─────────► Result (no email needed)
             • Hours lost / week, / year, yearly cost
             • Realistic automation range (30–60%) in hours and €
             • "This is an estimate based on these assumptions:" + small-print list
             • [Get My Growth Audit]  (opens Calendly)
             • [Email me the breakdown] → Email step
  Email step  email + consent checkbox (link to /privacy, new tab) + honeypot
  ─────────► Confirmation ("Check your inbox") + audit button again
```

- Progress: "Step 2 of 4" text plus the existing `ui/progress` bar. It shows on input steps only.
- Back button on every step after step 1. Inputs are kept when going back.
- Closing and reopening within the same page view keeps the inputs. A full page reload resets them.

## 4. Formulas (single source: `src/lib/calculator.ts`, pure, unit-tested)

```
weeklyHours      = people × hoursPerPerson
yearlyHours      = weeklyHours × WORKING_WEEKS            (46)
yearlyCost       = yearlyHours × hourlyCost
automatable      = [yearlyHours × 0.30, yearlyHours × 0.60]
automatableCost  = [yearlyCost  × 0.30, yearlyCost  × 0.60]
```

- Constants come from `src/config/calculator.ts`. They're never hard-coded in components.
- Rounding happens only at display: hours to whole numbers, € to whole euros. Format with
  `Intl.NumberFormat` using the page locale (`en-IE`, `nl-BE`, `fr-BE`), currency EUR.
- The Edge Function **recomputes** the result from the inputs and never trusts client numbers.
  It imports the same `calculator.ts` (see §6.3 on sharing code).
- Assumptions shown in small print, all from config and interpolated into copy:
  46 working weeks a year · the 30–60% range is Impera's estimate, not a measured figure · the
  hourly cost is the visitor's own figure · hours are split evenly across selected tasks (report only).

## 5. Configuration and copy

### 5.1 `src/config/calculator.ts` (new)

```ts
// Calculator numbers and assumptions. Change them here; the modal, the result
// small print and the report email all update.
export const calculator = {
  people:       { min: 1, max: 50, default: 3 },
  hoursPerWeek: { min: 1, max: 20, default: 5 },
  hourlyCost:   { min: 10, max: 500, default: 40 },
  workingWeeksPerYear: 46,
  automationRange: { low: 0.3, high: 0.6 },
  notWorthItHoursPerWeek: 2,   // even-split team hours below this → "probably not worth it"
  tasks: [ /* id + fit, see 5.3 */ ],
} as const;
```

### 5.2 `src/i18n/locales/{en,nl,fr}/calculator.json` (new, one top-level section `calculator`)

Key groups: `calculator.strip.*` (homepage strip), `calculator.steps.*` (labels, help text,
validation messages), `calculator.tasks.<id>` (task names), `calculator.result.*` (headings,
assumption lines with `{{weeks}}`, `{{low}}`, `{{high}}` placeholders), `calculator.email.*`
(form, consent with `<link>…</link>`, success and error), `calculator.report.*` (email subject,
section headings, fit labels, disclaimer), `calculator.a11y.*` (close label, step announcements).
Also update the table in `src/i18n/locales/README.md`.

### 5.3 Task "automation fit" (confirmed)

| id | Task | Fit | Why (shown in report) |
|---|---|---|---|
| `documents` | Document processing | high | Repetitive, rule-based, structured output |
| `dataEntry` | Data entry | high | Copying between systems is the classic automation case |
| `invoicing` | Invoicing | high | Templated, triggered by known events |
| `followUps` | Follow-up emails | medium | Templating works, but tone and timing need human review |
| `reporting` | Reporting | medium | Data gathering automates well, interpretation doesn't |
| `quotes` | Quotes | medium | Depends on how standardised the pricing is |

None of the fit levels carries a percentage. They are labels, not statistics.

## 6. Architecture

### 6.1 Frontend files

| File | Kind | Purpose |
|---|---|---|
| `src/config/calculator.ts` | new | Limits, constants, task list and fit |
| `src/lib/calculator.ts` | new | `computeResult(inputs)`, `buildReport(inputs, lang)` (ranking + "automate first" + "not worth it"), zod `inputsSchema`. Pure, no React |
| `src/lib/calculator.test.ts` | new | Formula, bounds, rounding, ranking, not-worth-it rule |
| `src/lib/track.ts` | new | `track(event, meta)`: fire-and-forget insert + optional `gtag`, never throws |
| `src/components/sections/HoursCalculatorStrip.tsx` | new | Homepage strip (navy band, gold CTA), owns `open` state |
| `src/components/calculator/HoursCalculatorModal.tsx` | new | Radix `Dialog` shell, step state machine |
| `src/components/calculator/steps/*.tsx` | new | `NumberStep` (shared by steps 1–3: slider + number input), `TasksStep`, `ResultView`, `EmailStep`, `DoneView` |
| `src/components/calculator/HoursCalculatorModal.test.tsx` | new | Keyboard, Escape, focus return, step validation |
| `src/pages/Index.tsx` | edit | Insert `<HoursCalculatorStrip />` between `<HeroSection />` and `<ServicesSection />` (D1) |
| `src/i18n/locales/*/calculator.json` | new | Copy (D2/D3) |
| `src/i18n/locales/*/legal.json` | edit | Privacy update (D8) |
| `src/integrations/supabase/types.ts` | regen | `npx supabase gen types typescript --project-id vxeaywnlscwrcvlfuuqv` |

Reuse: `ui/dialog`, `ui/slider`, `ui/checkbox`, `ui/progress`, `ui/button`, `ui/label`,
`CalendlyDialog`, `sonner` toasts, zod. Follow the `ExitIntentPopup` pattern where dictionary keys
are used as zod error messages. No new npm dependencies.

### 6.2 Modal state machine

`step: "people" | "hours" | "cost" | "tasks" | "result" | "email" | "done"`. A single
`useReducer` holds `inputs`, `step` and `submitStatus`. "Next" is disabled until the current
input is valid. `finished` fires once, when the reducer first enters `result`.

### 6.3 Backend

**Migration** `supabase/migrations/<ts>_hours_calculator.sql`:

```sql
CREATE TABLE public.calculator_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (char_length(email) <= 255),
  language text NOT NULL CHECK (language IN ('en','fr','nl')),
  inputs jsonb NOT NULL,          -- {people, hoursPerWeek, hourlyCost, tasks[]}
  result jsonb NOT NULL,          -- server-computed
  consent_at timestamptz NOT NULL,
  report_sent_at timestamptz,     -- null = email failed, can be retried from the dashboard
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calculator_submissions ENABLE ROW LEVEL SECURITY;
-- No anon policies: only the Edge Function (service role) writes.
CREATE POLICY "Admins can view calculator submissions" ON public.calculator_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete calculator submissions" ON public.calculator_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.calculator_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event text NOT NULL CHECK (event IN ('started','finished','email_submitted','audit_clicked')),
  run_id uuid NOT NULL,           -- random per modal open, held in memory only
  language text NOT NULL CHECK (language IN ('en','fr','nl')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.calculator_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log calculator events" ON public.calculator_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view calculator events" ON public.calculator_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
```

Submissions don't use an anon insert policy, unlike `leads`. Routing them through the function
stops anyone from triggering emails to arbitrary addresses by writing to the table directly.

**Edge Function** `supabase/functions/calculator-report/index.ts` (Deno):

1. Accept `POST {email, language, inputs, consent: true, website: ""}` (`website` is the honeypot).
   Handle CORS for the site origins only.
2. Validate with zod (same `inputsSchema`). Reject if `consent !== true`. If the honeypot is
   filled, return 200 silently.
3. Simple abuse guard: reject if the same email already has a submission in the last 10 minutes.
4. Recompute `result` and build the report via the shared `src/lib/calculator.ts`.
5. Insert the row with the service role. Send via Resend. On success, set `report_sent_at`.
6. Return `{ok: true}` even if the email fails after the row is saved (the row is the lead).
   Log the failure. The client shows an error only if validation or the insert failed.

The email is plain, well-structured HTML (inline styles, navy and gold), in the submission's
language. It contains the inputs, the result and the range, tasks ranked by fit then hours,
"automate first" (top high-fit task), "probably not worth automating" (low fit, or under
`notWorthItHoursPerWeek`), the assumptions block and the audit link. No tracking pixels.

**Code and copy sharing (verify first, step 0):** the function must import
`src/lib/calculator.ts`, `src/config/calculator.ts` and `src/i18n/locales/*/calculator.json`
(the `report` section) by relative path. Confirm that `supabase functions deploy` bundles imports
from outside `supabase/functions/`. If it doesn't, add `npm run sync:function-shared`, which copies
those three files into `supabase/functions/_shared/`, and add a test that fails when the copies
drift. Copy must not be duplicated by hand.

**Secrets:** `RESEND_API_KEY`, `REPORT_FROM` (e.g. `Impera <report@impera-group.com>`),
`SITE_URL`. Set them with `supabase secrets set`. Never prefix them with `VITE_`.

## 7. Event tracking

| Event | Fires when | Once per run |
|---|---|---|
| `started` | Modal opens from the strip | yes |
| `finished` | Result view is first shown | yes |
| `email_submitted` | Edge Function returned `ok` | yes |
| `audit_clicked` | Either audit button clicked (result or done view) | no |

`track()` is fire-and-forget. It never blocks the UI or shows errors. Funnel query (SQL editor):
`SELECT event, count(DISTINCT run_id) FROM calculator_events WHERE created_at > now() - interval '30 days' GROUP BY 1;`

## 8. Accessibility and mobile

- Radix Dialog gives focus trap, Escape to close, `aria-modal` and focus return to the strip button.
  Don't use the custom overlay pattern from `ExitIntentPopup`.
- `DialogTitle` = calculator title. `DialogDescription` = current step question.
- Move focus to the step heading or first input on each step change. Announce "Step 2 of 4" in
  an `aria-live="polite"` region.
- Pair each slider with a labelled `<input type="number" inputMode="numeric">`. Both edit
  the same value, so keyboard and screen-reader users never depend on the slider.
- Tasks: real checkboxes styled as chips, inside a `<fieldset>` with a `<legend>`.
- Errors: `aria-invalid` + `aria-describedby` + `role="alert"` (same as ExitIntentPopup).
- Translate the close button label (the shared `dialog.tsx` has a hard-coded "Close", so pass a
  translated one or add a prop).
- Mobile: full-height sheet below `sm` (`h-[100dvh]`, sticky footer with Back/Next). Centered card
  `max-w-lg` from `sm` up. Touch targets ≥ 44px. Test at 360px width, with the keyboard open.
- Respect `prefers-reduced-motion` for step transitions.

## 9. Privacy and compliance

- Consent checkbox is unchecked by default and required for the email step. Its label links to
  the localized `/privacy` (new tab, so inputs aren't lost).
- Store `consent_at`. The consent covers sending this one report. Newsletter or marketing use
  needs a separate opt-in, which isn't part of this feature.
- Privacy policy (D8): add the calculator data to §2 "Data We Collect", the purpose to §3, the
  retention period to §6 (**24 months**, confirmed), and Resend to §8 "Third-Party Services".
- Events contain no personal data, IP, user agent, cookies or storage.

## 10. Implementation order

Each step ends green on `npm run lint && npm test && npm run build`.

0. **Spikes:** verify Edge Function bundling of `src/` imports (§6.3). Paul creates the Resend
   account, verifies `impera-group.com` (DNS records) and provides the API key.
1. `src/config/calculator.ts` + `src/lib/calculator.ts` + unit tests (formulas, ranking, edges at
   min and max).
2. `calculator.json` EN/NL/FR (`npm run check:texts` passes) + README table row.
3. Modal shell + steps 1–4 + result view (no backend). Modal tests.
4. Strip component + `Index.tsx` placement + audit button via `CalendlyDialog`.
5. Migration (back up nothing; additive only) → `supabase db push` → regenerate `types.ts`.
6. `track.ts` + wire the 4 events.
7. Edge Function + Resend + email template (EN/NL/FR) → `supabase functions deploy calculator-report`.
8. Email step + done view, wired to the function (`supabase.functions.invoke`).
9. Privacy policy updates in `legal.json` ×3.
10. QA (§11), then commit (stage only the changed files) and deploy.

## 11. Acceptance checklist

- [ ] Strip visible in EN, NL and FR. Modal opens, closes with Escape, X and overlay. Focus returns to the strip button.
- [ ] Tab order is correct and focus never leaves the modal. Works with VoiceOver (macOS + iOS).
- [ ] Inputs are clamped to their limits and invalid input blocks "Next" with a message.
- [ ] Result for 3 people × 5 h × €40 = 15 h/week, 690 h/year, €27,600/year, 207–414 h and €8,280–€16,560 automatable.
- [ ] The words "estimate" and "assumptions" are visible next to the range. Assumptions are in small print.
- [ ] Result shows without an email. The email step can't be submitted without consent.
- [ ] Submission row has email, inputs, server result, language, consent_at, created_at. Report arrives in the right language.
- [ ] Direct anon insert into `calculator_submissions` is rejected (RLS).
- [ ] Events appear in `calculator_events`: started → finished → email_submitted. audit_clicked fires from both buttons.
- [ ] Layout works at 360px, 768px and 1440px. No horizontal scroll. The keyboard doesn't hide the Next button.
- [ ] No statistic appears anywhere that isn't the visitor's own input or a labelled config assumption.
- [ ] Privacy policy updated in all three languages.

## 12. Out of scope (later)

An admin view of submissions in `/admin` (use the Supabase dashboard for now), A/B testing the
copy, CRM sync, and PDF reports.
