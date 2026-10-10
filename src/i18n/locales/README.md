# Website texts

All the text visitors see on the website lives in this folder, once per language:

```
locales/
├── en/   English (the reference language)
├── fr/   French
└── nl/   Dutch
```

Each language folder has the same files, one per part of the site:

| File | What it contains |
|---|---|
| `common.json` | Menu, footer, cookie banner, newsletter popup, booking dialog, 404 page, shared messages |
| `home.json` | Home page: hero, services, results, why Impera, about, guarantee, process, FAQ, call to action |
| `services.json` | Services page |
| `our-services.json` | Our Services page |
| `products.json` | Products page |
| `methodology.json` | How We Work page |
| `about.json` | About page |
| `blog.json` | Blog page and blog articles (labels only — articles themselves are written in `/admin`) |
| `careers.json` | Careers page and job pages (labels only — job openings are written in `/admin`) |
| `contact.json` | Contact page |
| `legal.json` | Full text of the Privacy Policy and Terms of Service |

Contact details (email, phone, address, Calendly link, website address) are not here — they are in
`src/config/company.ts`, so they only need changing in one place.

## How to change a text

Each line looks like this:

```json
"title1": "Command Your Growth.",
```

**Only change the text on the right, between the quotes.** The name on the left
(`"title1"`) is how the website finds the text — never rename or delete it.

To change the same text in every language, edit the same line in `en/`, `fr/` and `nl/`.

### Rules that keep the site working

- **Keep the quotes.** Every text starts and ends with `"`.
- **Quotes inside a text** must be written as `\"` — for example `"Read the \"Guide\""`.
  Apostrophes (`'`) are fine as they are.
- **Keep the comma** at the end of the line if there was one (the last line of a group has none).
- **Keep `{{name}}` placeholders and `<link>…</link>` tags exactly as they are.** You can
  move them within the sentence and change the words between `<link>` and `</link>`.
- **Don't leave a text empty.** If a text should disappear, ask a developer.
- **Add or remove texts only together with a developer** — the page has to be changed too.
  (The legal texts are the exception: see below.)

## Legal texts (`legal.json`)

Each document is a list of sections. A section has a `"title"` and, optionally:

- `"paragraphs"` — text under the title
- `"list"` — bullet points
- `"afterList"` — text after the bullet points

To add a paragraph or bullet point, add a new line in quotes to the right list, with a
comma between items. Sections can be added the same way. Keep the structure identical
in all three languages.

`<b>…</b>` highlights a label (e.g. `"<b>Access</b> — Request a copy…"`) and
`<calendlyPolicy>…</calendlyPolicy>` is the link to Calendly's privacy policy.

> The French and Dutch files currently contain the English legal text, awaiting a
> professional translation. Replace the text in `fr/legal.json` and `nl/legal.json`
> when it is ready.

## Checking your changes

Before publishing, a developer (or anyone with the project installed) can run:

```
npm run check:texts
```

It reports, in plain terms, any text that is missing in one language, left empty,
or has a broken `{{placeholder}}` or `<link>` tag.

If a file has a typo that breaks its format (a missing quote or comma), the website
build fails and the live site stays as it was, so a mistake can't take the site down.
