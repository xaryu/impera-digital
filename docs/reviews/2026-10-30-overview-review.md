# Overview code review (2026-10-30)

Quick pass over branch `feature/hours-calculator-impl`. Nothing was run. Covers the
`calculator-report` Edge Function, the three calculator migrations, RLS policies and storage
buckets, and risky HTML rendering in the frontend. Findings are ranked by importance.

## Findings

### 1. The per-IP limit can probably be bypassed (needs a test)

`supabase/functions/calculator-report/index.ts:33`

`hashIp` takes the **first** entry of `X-Forwarded-For`. In most proxy setups the client can set
that header and the proxy adds its own entry at the end. A caller who sends a random value on each
request would then get a new IP hash every time, so the 5-per-hour limit does nothing.

- **Impact:** one script could use the whole global cap of 100 per hour. The calculator would
  return 503 for every real visitor, and 100 confirmation emails per hour would go out from
  `mail.impera-group.com` to any addresses. That hurts the domain's sending reputation.
- **How to check:** run `curl` against the function twice with different fake `X-Forwarded-For`
  values, then see if the two rows get different `ip_hash` values.
- **Fix:** use the last entry, or whichever header Supabase's gateway sets itself.
- **Status:** not confirmed how Supabase's gateway handles this header, so this is likely but
  unproven.

### 2. Anyone can upload any file of any size to the CV bucket

- **Where:** `supabase/migrations/20260224171355_efc20081-51e5-40dc-b2b5-4ecb74caf21e.sql:69-73`
  and `src/pages/CareerPost.tsx:39`.
- **Problem:** the policy is `INSERT WITH CHECK (bucket_id = 'cv-uploads')` with no
  `file_size_limit` and no `allowed_mime_types` on the bucket. Without logging in, anyone can push
  unlimited files of any type into storage, which costs money and can fill it up.
- **Fix:** set a size limit (e.g. 5 MB) and limit the bucket to PDF/DOCX. Ideally, uploads should
  also go through a rate-limited function.

### 3. Stored XSS on the blog

`src/pages/BlogPost.tsx:119-127`

Post content from the database goes into `dangerouslySetInnerHTML` without escaping; only the
`**`/`*` markers are turned into HTML. Only admins can write posts, so the risk is lower. But if
content is pasted from somewhere, or an admin account is compromised, a script runs on the public
site and in other admins' browsers (where it can use their sessions).

- **Fix:** escape `<`, `>`, `&` and `"` before applying the markdown replacements.

### 4. The global cap can lock out real visitors (known, still open)

`supabase/migrations/20261030170000_calculator_double_optin.sql:87`

`claim_calculator_submission` counts every row towards the 100-per-hour cap, including rows that
never got a confirmation email out. This is already in the project notes, but if #1 is real it
takes one attacker, not many IPs.

- **Possible fix:** make the global cap count only rows where a confirmation email was actually
  sent.

### 5. Public forms have no rate limit

`leads`, `contact_submissions` and `job_applications` all allow anonymous
`INSERT … WITH CHECK (true)` straight from the browser. That leaves them open to spam and table
bloat. Low risk on its own, but it pairs with #2: each spam application can bring its own uploaded
file.

### 6. Housekeeping: `CLAUDE.md` is out of date

It says the double opt-in code is "not committed yet", but commit `65efb6d` contains it and the
working tree is clean. Fix it so the next session doesn't redo work.

## Checked and fine

- The report email escapes everything it inserts, and the inputs are numbers or values from a
  fixed list.
- The `SECURITY DEFINER` functions can only be called with the service role, and
  `CREATE OR REPLACE` keeps those permissions.
- The confirmation token has 32 random bytes and only its hash is stored. Confirming needs a POST
  and is protected by a lock, and the report send uses an idempotency key, so a double click can't
  send two reports.
- Admin RLS policies: the old "any logged-in user" policies were removed and replaced with
  `has_role(…,'admin')`.

## Suggested order

1. Test #1 (a quick `curl`), fix if confirmed.
2. Fix #2 (small migration).
3. Fix #3.
