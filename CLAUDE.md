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
- Modals: use `@/components/ui/dialog` (Radix: focus trap, Escape). Audit/booking CTAs open
  `CalendlyDialog`.
- Forms: zod schemas whose error messages are dictionary keys (see `ExitIntentPopup.tsx`).
- Supabase: every table has RLS. Admin access goes through `public.has_role(auth.uid(), 'admin')`.
  Public forms insert with anon policies. Anything that sends email must go through an Edge Function
  using the service role. Regenerate `src/integrations/supabase/types.ts` after migrations.
- Privacy: new personal-data collection requires updating `legal.json` (all languages).
- Tracking: GA4 and Meta load only after cookie consent (`use-tracking-consent.ts`).

## Active work

- **Hours-lost calculator (homepage modal + email report)**: in progress; branch
  `feature/hours-calculator-impl` (pushed) was merged into `main` on 2026-10-30. Plan steps 1-6 are committed. Steps 7 (code only), 8
  and 9 are committed: `supabase/functions/calculator-report` (Deno
  type-checked, shared code synced via `npm run sync:function-shared` into `_shared/`, drift test in
  `src/lib/function-shared.test.ts`), the email/done steps in the modal, and the privacy update in
  `legal.json`. Function is deployed and `RESEND_API_KEY` is set (2026-10-30); not done: the move
  to `impera.digital` (below), the real send test and step 10 QA.
  Full technical plan: [`docs/plans/hours-calculator.md`](docs/plans/hours-calculator.md).
  Read it before touching this feature. The remote `origin/feature/hours-calculator` is a different
  implementation; only borrow from it (see its `report.ts` for the email template at step 7).
- **Open review findings (not fixed, decide before step 10 QA)**. The review fixes for failed sends,
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
    `20261030190000_calculator_cap_sent_only.sql` makes that cap count only confirmation emails sent
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
- **Step 7 Resend setup (resume here)**, following https://resend.com/setup.md:
  - Done: Resend MCP plugin installed (user scope) and signed in via OAuth. Domain
    `mail.impera-group.com` (ID `ca214ee7-e51a-4dbc-8a62-d7bef76ed356`, `eu-west-1`) is
    **verified**; `RESEND_API_KEY`, `REPORT_FROM` and `SITE_URL` (`https://impera-digital.vercel.app`)
    are set and `calculator-report` is deployed to project `hcotcpkpxcheeptejmum`. Note that
    `supabase/config.toml` `project_id` is a stale Lovable ref; pass `--project-ref` to the CLI.
  - **Moving to `impera.digital` (decided 2026-10-30)**: the sender and the contact addresses change.
    Code is on branch `chore/impera-digital-domain` (`company.ts` → `contact@` / `careers@impera.digital`,
    `_shared` synced). Domain `mail.impera.digital` created in Resend (ID
    `da8f7c17-cc32-4c1d-9746-33cf7b42917a`, `eu-west-1`), **verified** on 2026-10-30. `impera.digital` is on
    the boss's GoDaddy account and has **no MX records**, so it can't receive mail yet. Root DMARC
    already exists (`p=quarantine`), so don't add another. Order:
    1. Done: Resend records added and domain verified. Still open: mailboxes for `contact@` and
       `careers@impera.digital` (e.g. Zoho, as on `impera-group.com`); no MX records yet.
    2. If the current API key is restricted to the old domain,
       create a new **sending-only** key for `mail.impera.digital` (never full access); Paul sets it himself.
    3. Paul sets `REPORT_FROM="Impera <report@mail.impera.digital>"`; send a real test report.
    4. Only after MX works: merge `chore/impera-digital-domain` into `main` and deploy (otherwise
       visitor emails to the contact addresses bounce). Then step 10 QA. Remove the old domain later.
  - Function bundling is decided: use the sync script, no cross-folder imports. Never ask for or
    accept an API key pasted in chat.
