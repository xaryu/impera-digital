// The notification the owner gets for each public form submission. Internal email, English only,
// plain layout. Everything the visitor typed is escaped.

export type Field = { label: string; value: string | null | undefined };

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// A subject line is one line: visitor input must not add headers or break it.
const oneLine = (text: string) => text.replace(/[\r\n\t]+/g, " ").trim().slice(0, 150);

export const buildNotificationEmail = (
  title: string,
  fields: Field[],
  link?: { label: string; url: string },
) => {
  const rows = fields
    .filter((field) => field.value)
    .map(
      (field) =>
        `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;color:#5b6573;white-space:nowrap">${escapeHtml(field.label)}</td>` +
        `<td style="padding:8px 0;color:#1a1a1a">${escapeHtml(field.value!).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const linkHtml = link
    ? `<p style="margin:24px 0 0"><a href="${escapeHtml(link.url)}" style="color:#1b2a41;font-weight:bold">${escapeHtml(link.label)}</a></p>`
    : "";
  const html =
    `<!doctype html><html><body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;background:#ffffff">` +
    `<h1 style="font-size:18px;margin:0 0 16px;color:#1b2a41">${escapeHtml(title)}</h1>` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0">${rows}</table>${linkHtml}` +
    `<p style="margin:24px 0 0;color:#5b6573;font-size:12px">Reply to this email to answer the sender directly.</p>` +
    `</body></html>`;
  const text = [
    title,
    "",
    ...fields.filter((field) => field.value).map((field) => `${field.label}: ${field.value}`),
    ...(link ? ["", `${link.label}: ${link.url}`] : []),
  ].join("\n");
  return { subject: oneLine(title), html, text };
};
