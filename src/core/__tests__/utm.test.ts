import { describe, it, expect } from "vitest";
import { extractUtmParams } from "../utm";

describe("extractUtmParams", () => {
  it("extracts UTM params from search params", () => {
    const result = extractUtmParams({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "summer",
      unrelated: "value",
    });
    expect(result).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "summer",
    });
  });

  it("handles array values (takes first)", () => {
    const result = extractUtmParams({ utm_source: ["google", "bing"] });
    expect(result).toEqual({ utm_source: "google" });
  });

  it("returns empty object when no UTM params", () => {
    const result = extractUtmParams({ id: "123", name: "test" });
    expect(result).toEqual({});
  });

  it("extracts campaign param", () => {
    const result = extractUtmParams({ campaign: "winter" });
    expect(result).toEqual({ campaign: "winter" });
  });
});
