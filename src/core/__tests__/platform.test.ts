import { describe, it, expect } from "vitest";
import { detectPlatform } from "../platform";

describe("detectPlatform", () => {
  it("returns 'android' for Android UA", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36",
      ),
    ).toBe("android");
  });

  it("returns 'ios' for iPhone UA", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe("ios");
  });

  it("returns 'ios' for iPad UA", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      ),
    ).toBe("ios");
  });

  it("returns 'desktop' for desktop UA", () => {
    expect(
      detectPlatform(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      ),
    ).toBe("desktop");
  });

  it("returns 'desktop' for null UA", () => {
    expect(detectPlatform(null)).toBe("desktop");
  });

  it("returns 'desktop' for empty string", () => {
    expect(detectPlatform("")).toBe("desktop");
  });
});
