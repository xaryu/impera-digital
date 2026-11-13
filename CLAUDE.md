# Impera Digital — project notes for Claude

Marketing site for Impera (growth & automation agency, Leuven). Vite 7 + React 19 + TypeScript,
Tailwind + shadcn/ui, React Router 7, i18next, Supabase (DB, auth, storage). Deployed on Vercel
(SPA rewrite in `vercel.json`). Originally a Lovable project.

## Commands

Run `source ~/.nvm/nvm.sh && nvm use 24` first (Node 24, see `.nvmrc`).

- `npm run dev` — local dev server
- `npm test` — vitest (includes the translation checks)
- `npm run check:texts` — translation files only
- `npm run lint` / `npm run build`

## Conventions

- **Copy lives in `src/i18n/locales/{en,fr,nl}/<page>.json`**, never in components. Every language
  must have the same files and keys (`src/i18n/dictionaries.test.ts` enforces it, and also checks
  that every `t("section.key")` used in code exists). Non-developers edit these files, see
  `src/i18n/locales/README.md`.
- **Facts and numbers live in `src/config/`** (`company.ts` = contact details, Calendly URL).
- Routing: English has no prefix, FR/NL use `/fr/...` and `/nl/...`. Use `LocalizedLink` for internal links.
- Brand: `navy` / `gold` / `cream` Tailwind colors, `font-display` (Playfair Display) for headings,
  `font-body` (DM Sans) for text. Look at existing sections before styling.
- Modals: use `@/components/ui/dialog` (Radix: focus trap, Escape).
- Audit/booking CTAs use `BookingLink`, which opens the calendar in a new tab.
- Forms: zod schemas whose error messages are dictionary keys (see `ExitIntentPopup.tsx`).
- Supabase: every table has RLS. Admin access goes through `public.has_role(auth.uid(), 'admin')`.
  Public forms insert with anon policies. Anything that sends email must go through an Edge Function
  using the service role. Regenerate `src/integrations/supabase/types.ts` after migrations.
- Privacy: new personal-data collection requires updating `legal.json` (all languages).
- Tracking: GA4 and Meta load only after cookie consent (`use-tracking-consent.ts`).

## Active work

- **Follow-up feedback (2026-11-13, branch `feature/footer-homepage-copy`, not merged yet)**: hero
  eyebrow removed, homepage heading "The Hidden Cost of Standing Still", new footer description,
  address Groenstraat 80 Heverlee, footer services link to `/services#<id>` (list in
  `src/config/services.ts`), footer button "Get in Touch". Details and open items: "Follow-up
  feedback" in [`docs/plans/launch-feedback.md`](docs/plans/launch-feedback.md). Paul checks the
  new FR/NL text.
  **Code review 2026-11-13**, all 10 status: **fixed** (same branch). 1, 2, 3 and 8 were fixed by
  replacing the hook with `ScrollOnNavigate` in `src/hooks/use-scroll-on-navigate.ts`; the old file
  `use-scroll-to-hash.ts` named below is gone. The language switch passes `state.keepScroll`. 10 restores
  the originals in `afterEach`, because jsdom has no `scrollIntoView` to spy on. 6 is covered by
  `src/config/services.test.ts`.
  1. `src/hooks/use-scroll-to-hash.ts:38`: if the hash target isn't found within 30 frames the hook
     gives up, and since `LocalizedLink` skips scroll-to-top for hash links, the page opens at the
     old scroll offset. Fix: fall back to `window.scrollTo(0, 0)` when the target is never found.
  2. `src/components/layout/LocalizedLink.tsx:15`: `hasHash` is true for a bare `#` (`/#`,
     `/services#`), which the hook ignores, so neither scroll happens. Fix: treat only a non-empty
     fragment as a hash.
  3. `src/hooks/use-scroll-to-hash.ts:50`: effect runs on back/forward (POP) too and overrides scroll
     restoration and steals focus. Fix: skip when `useNavigationType() === "POP"`.
  4. `src/components/layout/LanguageSwitcher.tsx:39`: language switch drops `location.hash`. Fix:
     append `location.hash` (and `search`) to the new URL.
  5. `src/pages/Services.tsx:53`: `focus:outline-none` hides focus on the programmatically focused
     section (WCAG 2.4.7). Fix: use a visible `focus-visible` ring, or drop the class.
  6. `src/components/layout/Footer.tsx:13`: template-literal key `servicesPage.${titleKey}` is
     invisible to the dictionary test, so a missing key ships as raw text. Fix: add a test that every
     key in `src/config/services.ts` exists in all locales.
  7. `src/config/services.ts:10`: `ai-automation` still uses `brandIdentity*` keys. Fix: rename to
     `aiAutomation*` in all three `services.json` and the config.
  8. `src/components/layout/LocalizedLink.tsx:20`: scroll-to-top lives in the link's onClick while
     anchor scrolling is router-level; `navigate()` and plain links get neither. Fix: handle both in
     the router-level hook (top on pathname change without hash, else anchor with top fallback) and
     remove the onClick scroll. Fixes 1 and 2 at the root.
  9. `src/components/layout/SEO.tsx:14`: `DEFAULT_DESCRIPTION` is read from `resources.en`, so FR/NL
     pages without a description prop get English meta. Fix: use `t("homePage.seoDescription")`.
  10. `src/components/layout/Footer.test.tsx:41`: global `scrollIntoView`/`scrollTo` mocks never
      restored; address hard-coded instead of read from `company.ts`. Fix: `vi.spyOn` + restore in
      `afterEach`, assert against the config value.

- **Launch feedback (built 2026-11-06, merged to `main` and `calculator-report` deployed as v10 on 2026-11-07)**:
  final feedback round before launch, all six items: homepage, booking, emails. Plan and
  decisions: [`docs/plans/launch-feedback.md`](docs/plans/launch-feedback.md). Still to do: Paul checks
  the NL/FR copy, real mail-client tests (Gmail web/mobile light and dark, Apple Mail, Outlook),
  one real submission. Preview emails with `npm run render:email-samples`.
- **Hours-lost calculator (homepage modal + email report)**: live on `main` since 2026-10-30
  (branches `feature/hours-calculator-impl` and `chore/impera-digital-domain` merged and pushed).
  `supabase/functions/calculator-report` is Deno type-checked; shared code is synced via
  `npm run sync:function-shared` into `_shared/` (drift test in `src/lib/function-shared.test.ts`).
  Step 10 QA done on 2026-10-30 against the live site: plan §11 checklist passes (except the items
  under "Not done" below) in EN/NL/FR at 360/768/1440 px, real submission through the modal → confirm page → report delivered, all four
  events recorded, link is one-time. Fixed during QA: `<link>` tags in translations rendered empty
  (void HTML element, renamed to `<privacy>`, test added), 44px dialog close button, cookie banner
  waits while a modal is open. Not done: VoiceOver (macOS/iOS) and a real phone with the keyboard
  open (Paul), contact mailboxes on `impera.digital` (below).
  Full technical plan: [`docs/plans/hours-calculator.md`](docs/plans/hours-calculator.md).
  Read it before touching this feature. The remote `origin/feature/hours-calculator` is a different
  implementation; only borrow from it (see its `report.ts` for the email template at step 7).
- **Review findings (feature is live; the X-Forwarded-For test below is still open)**. The review fixes for failed sends,
  stale retry, race-loser status, email state on reopen and close-while-sending are committed, and
  the function was redeployed on 2026-10-30 (`npx supabase functions deploy calculator-report`; the CLI is
  a dev dependency, not on PATH). If Resend rejects a send the function returns 502 and the modal
  shows its error. Remaining:
  - Abuse: double opt-in is implemented (migration `20261030170000_calculator_double_optin.sql` pushed and
    `calculator-report` redeployed on 2026-10-30; committed in `65efb6d`). Submitting only sends a short
    confirmation email; the report goes out when the visitor presses the button on
    `/calculator/confirm?token=` (POST `{action:"confirm", token}`, 24h one-time link, only the token
    hash is stored). No CAPTCHA by decision. Still true: the domain can be used to send one short
    confirmation email to any address, and an attacker with many IPs gets around the per-IP limit
    of 5/hour, while the global 100/hour cap can lock real visitors out with 503. Migration
    `20261030190000_calculator_cap_sent_only.sql` (pushed, confirmed 2026-10-31) makes that cap count only confirmation emails sent
    (or being sent) in the last hour, not every attempt.
  - **Untested (review 2026-10-30 #1)**: `hashIp` uses the first `X-Forwarded-For` entry (as
    Supabase's own examples do). If the gateway keeps a client-supplied value there, the per-IP limit
    is bypassable. Test: 6 POSTs with different fake `X-Forwarded-For`; the 6th should get 503
    `ip_limited`. Don't switch to the last entry blindly, it may be a proxy IP shared by everyone.
  - Public forms (review 2026-10-30 #2, #5) hardened in `20261030180000_public_forms_hardening.sql`
    (pushed): `cv-uploads` limited to 10 MB PDF/DOC/DOCX, only into a published opening's folder,
    30/hour; hourly insert caps (leads 100, contact 50, applications 30) and length checks.
    `src/integrations/supabase/types.ts` regenerated after the push. Confirm-link text in `calculator.confirmEmail.*` / `confirmPage.*`.
  - Fixed in migration `20261030150000_calculator_hardening.sql` (pushed and `calculator-report`
    redeployed as v5 on 2026-10-30): atomic dedupe/cap/insert via the `claim_calculator_submission` RPC, `created_at`
    index, per-IP limit (HMAC of the IP, cleared after 24h, stated in `legal.json`), plus-address
    dedupe (`email_key`), a sending lock (409 while another request sends), `calculator_events` insert
    bounded (timestamp check, 8 per run_id, 1000/hour in total, 12-month retention). Always push migrations before deploying the function, since it calls the RPC.
  - CORS allows only the origins in `SITE_URL` (localhost removed from the code, committed and
    deployed). Vercel previews and a custom domain need adding to `SITE_URL` (comma-separated); add
    `http://localhost:8080` there only while testing locally. The confirmation link is built from
    the request's allowed Origin, so `SITE_URL` must be set.
- **Resend setup (step 7, done)**, following https://resend.com/setup.md. Remaining open items for
  the feature: VoiceOver, real-phone keyboard test, `impera.digital` mailboxes/MX, X-Forwarded-For test.
  - Done: Resend MCP plugin installed (user scope) and signed in via OAuth. Domain
    `mail.impera-group.com` (ID `ca214ee7-e51a-4dbc-8a62-d7bef76ed356`, `eu-west-1`) is
    **verified**; `RESEND_API_KEY`, `REPORT_FROM` and `SITE_URL` (`https://impera-digital.vercel.app`)
    are set and `calculator-report` is deployed to project `hcotcpkpxcheeptejmum`. Note that
    `supabase/config.toml` `project_id` is a stale Lovable ref; pass `--project-ref` to the CLI.
  - **Moving to `impera.digital` (decided 2026-10-30)**: the sender and the contact addresses change.
    Code is on `main` (`chore/impera-digital-domain` merged; `company.ts` → `contact@` / `careers@impera.digital`,
    `_shared` synced). Domain `mail.impera.digital` created in Resend (ID
    `da8f7c17-cc32-4c1d-9746-33cf7b42917a`, `eu-west-1`), **verified** on 2026-10-30. `impera.digital` is on
    the boss's GoDaddy account and has **no MX records**, so it can't receive mail yet. Root DMARC
    already exists (`p=quarantine`), so don't add another. Order:
    1. Done: Resend records added and domain verified. Still open: mailboxes for `contact@` and
       `careers@impera.digital` (e.g. Zoho, as on `impera-group.com`); no MX records yet.
    2. Done (2026-10-30): `REPORT_FROM="Impera <report@mail.impera.digital>"` set; the existing API
       key works for the new domain. Real test via curl: confirmation and report both delivered.
    3. Merged and deployed on 2026-10-30 at Paul's request, before MX existed: until the boss adds
       `impera.digital` in Zoho (as an alias of `impera-group.com`) plus the Zoho MX/SPF records,
       mail to the contact addresses on the site bounces. Remove the old Resend domain later.
  - Function bundling is decided: use the sync script, no cross-folder imports. Never ask for or
    accept an API key pasted in chat.
