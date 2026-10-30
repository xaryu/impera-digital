import { describe, expect, it } from "vitest";
import { emailKey } from "./email-key";

describe("emailKey", () => {
  it("strips plus tags and lowercases", () => {
    expect(emailKey("Jane+news@Example.com")).toBe("jane@example.com");
  });

  it("strips gmail dots and maps googlemail to gmail", () => {
    expect(emailKey("j.a.n.e+x@googlemail.com")).toBe("jane@gmail.com");
  });

  it("keeps dots on other domains", () => {
    expect(emailKey("jane.doe@example.com")).toBe("jane.doe@example.com");
  });
});
