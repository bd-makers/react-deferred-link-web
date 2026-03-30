import { describe, it, expect, vi } from "vitest";
import { buildIosPasteboardPayload, buildAndroidReferrer } from "../payload";
import type { DeepLinkConfig } from "../types";

const config: DeepLinkConfig = {
  allowedHosts: ["example.com"],
  canonicalHost: "example.com",
  ddlPrefix: "myapp:ddl:",
  ddlReferrerKey: "ddl",
  ios: { appScheme: "myapp://", appStoreUrl: "https://apps.apple.com/app/id123" },
  android: { packageId: "com.example.app" },
};

describe("buildIosPasteboardPayload", () => {
  it("builds payload with prefix, timestamp, and URL", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const result = buildIosPasteboardPayload(config, "https://example.com/action/item?id=1");
    expect(result).toBe("myapp:ddl:1700000000|https://example.com/action/item?id=1");
    vi.restoreAllMocks();
  });
});

describe("buildAndroidReferrer", () => {
  it("builds referrer with key and encoded URL", () => {
    const result = buildAndroidReferrer(config, "https://example.com/action/item?id=1");
    expect(result).toBe("ddl=https%3A%2F%2Fexample.com%2Faction%2Fitem%3Fid%3D1");
  });
});
