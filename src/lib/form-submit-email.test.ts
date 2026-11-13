// The form-submit Edge Function's notification email, tested here because vitest only picks up
// files under src/.
import { describe, expect, it } from "vitest";
import { buildNotificationEmail } from "../../supabase/functions/form-submit/email.ts";

describe("form-submit notification email", () => {
  it("escapes everything the visitor typed", () => {
    const { html } = buildNotificationEmail("New contact message from <b>Eve</b>", [
      { label: "Message", value: `<script>alert(1)</script> & "quotes"` },
    ]);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<b>Eve</b>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;quotes&quot;");
  });

  it("keeps the subject on one line", () => {
    const { subject } = buildNotificationEmail("New contact message from Eve\r\nBcc: x@example.com", []);
    expect(subject).toBe("New contact message from Eve Bcc: x@example.com");
  });

  it("keeps line breaks in the message and drops empty fields", () => {
    const { html, text } = buildNotificationEmail("t", [
      { label: "Message", value: "line 1\nline 2" },
      { label: "Company", value: "" },
    ]);
    expect(html).toContain("line 1<br>line 2");
    expect(html).not.toContain("Company");
    expect(text).toBe("t\n\nMessage: line 1\nline 2");
  });

  it("adds the CV link", () => {
    const { html, text } = buildNotificationEmail("t", [], { label: "Download the CV", url: "https://x.test/cv?token=a&b=1" });
    expect(html).toContain('href="https://x.test/cv?token=a&amp;b=1"');
    expect(text).toContain("Download the CV: https://x.test/cv?token=a&b=1");
  });
});
