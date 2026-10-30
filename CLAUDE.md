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

- **Hours-lost calculator (homepage modal + email report)**: in progress on local branch
  `feature/hours-calculator-impl` (not pushed). Plan steps 1-6 are committed. Steps 7 (code only), 8
  and 9 are committed: `supabase/functions/calculator-report` (Deno
  type-checked, shared code synced via `npm run sync:function-shared` into `_shared/`, drift test in
  `src/lib/function-shared.test.ts`), the email/done steps in the modal, and the privacy update in
  `legal.json`. Function is deployed; not done: `RESEND_API_KEY`, the real send test (both wait for DNS) and step 10 QA.
  Full technical plan: [`docs/plans/hours-calculator.md`](docs/plans/hours-calculator.md).
  Read it before touching this feature. The remote `origin/feature/hours-calculator` is a different
  implementation; only borrow from it (see its `report.ts` for the email template at step 7).
- **Open review findings (not fixed, decide before step 10 QA)**. The review fixes for failed sends,
  stale retry, race-loser status, email state on reopen and close-while-sending are committed, and
  the function was redeployed on 2026-10-30 (`npx supabase functions deploy calculator-report`; the CLI is
  a dev dependency, not on PATH). Note that until `RESEND_API_KEY` is set the function now returns 502
  and the modal shows its error. Remaining:
  - Abuse, still open: no CAPTCHA or double opt-in, so the Impera domain can still be used to mail
    any address once (per-IP limit of 5/hour and plus-address dedupe are in the hardening migration,
    but an attacker with many IPs gets around the IP limit, and the global 100/hour cap can still
    lock real visitors out with 503).
  - Fixed in migration `20261030150000_calculator_hardening.sql` (pushed and `calculator-report`
    redeployed as v5 on 2026-10-30): atomic dedupe/cap/insert via the `claim_calculator_submission` RPC, `created_at`
    index, per-IP limit (HMAC of the IP, cleared after 24h, stated in `legal.json`), plus-address
    dedupe (`email_key`), a sending lock (409 while another request sends), `calculator_events` insert
    bounded (timestamp check, 8 per run_id, 1000/hour in total, 12-month retention). Always push migrations before deploying the function, since it calls the RPC.
  - CORS allows `SITE_URL` plus `localhost:8080` and `:5173` in production; Vercel previews and a
    custom domain need adding to `SITE_URL` (comma-separated). Consider dropping the localhost origins.
- **Step 7 Resend setup (resume here)**, following https://resend.com/setup.md:
  - Done: Resend MCP plugin installed (user scope) and signed in via OAuth. Domain
    `mail.impera-group.com` created in Resend, region `eu-west-1`, domain ID
    `ca214ee7-e51a-4dbc-8a62-d7bef76ed356`, status `not_started`. Sender will be
    `Impera <report@mail.impera-group.com>` (this replaces `impera-group.com` in plan D4 and §6.3).
  - **Blocked on DNS**: Paul does not own `impera-group.com`; the boss owns the GoDaddy account
    (nameservers `domaincontrol.com`). The boss must add the 4 records (get them with the Resend
    `get-domain` tool) or press Auto configure at `https://resend.com/domains/<id>`. Root DMARC
    already exists (`p=quarantine`), so don't add another.
  - Done (2026-10-30): `REPORT_FROM` and `SITE_URL` (`https://impera-digital.vercel.app`) secrets
    set and `calculator-report` deployed to project `hcotcpkpxcheeptejmum` (CORS and validation
    checked). Without `RESEND_API_KEY` the function stores the lead and skips the email. Note that
    `supabase/config.toml` `project_id` is a stale Lovable ref; the CLI is linked to the real project.
  - Next (once the boss added the DNS records): `verify-domain`, poll until `verified`; create a
    **sending-only** API key restricted to the domain (never the full-access key); Paul runs
    `supabase secrets set RESEND_API_KEY=...` himself; send a real test report; then step 10 QA and
    update the `Active work` notes. Function bundling is decided: use the sync script, no
    cross-folder imports.
  - Until the domain is verified, test sends can only go from `onboarding@resend.dev` to Paul's own
    address. Never ask for or accept an API key pasted in chat.
