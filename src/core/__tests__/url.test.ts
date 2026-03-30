import { describe, it, expect } from "vitest";
import {
  isAllowedHost,
  buildDeepLinkUrl,
  buildIosSchemeUrl,
  buildIosSchemeUrlFromParams,
  buildAppSchemeParams,
  buildAndroidStoreUrl,
  buildAndroidIntentUrl,
} from "../url";
import type { DeepLinkConfig } from "../types";

const config: DeepLinkConfig = {
  allowedHosts: ["example.com", "www.example.com"],
  canonicalHost: "www.example.com",
  ddlPrefix: "myapp:ddl:",
  ddlReferrerKey: "ddl",
  ios: { appScheme: "myapp://", appStoreUrl: "https://apps.apple.com/app/id123" },
  android: { packageId: "com.example.app" },
};

describe("isAllowedHost", () => {
  it("returns true for allowed host", () => {
    expect(isAllowedHost(config, "example.com")).toBe(true);
  });

  it("returns true case-insensitively", () => {
    expect(isAllowedHost(config, "EXAMPLE.COM")).toBe(true);
  });

  it("returns false for disallowed host", () => {
    expect(isAllowedHost(config, "evil.com")).toBe(false);
  });
});

describe("buildDeepLinkUrl", () => {
  it("builds URL with path and search params", () => {
    const result = buildDeepLinkUrl("www.example.com", "/action", "/item", { id: "1" });
    expect(result).toBe("https://www.example.com/action/item?id=1");
  });

  it("builds URL without path", () => {
    const result = buildDeepLinkUrl("www.example.com", "/action", undefined, {});
    expect(result).toBe("https://www.example.com/action");
  });

  it("handles array params", () => {
    const result = buildDeepLinkUrl("www.example.com", "/action", "/item", { tag: ["a", "b"] });
    expect(result).toBe("https://www.example.com/action/item?tag=a&tag=b");
  });
});

describe("buildIosSchemeUrl", () => {
  it("builds scheme URL with path and raw search", () => {
    const result = buildIosSchemeUrl(config, "/item", "?id=1&ref=abc");
    expect(result).toBe("myapp://item?id=1&ref=abc");
  });

  it("handles trailing slash in appScheme", () => {
    const result = buildIosSchemeUrl(config, "/item", "?id=1");
    expect(result).toBe("myapp://item?id=1");
  });
});

describe("buildIosSchemeUrlFromParams", () => {
  it("builds scheme URL from URLSearchParams", () => {
    const params = new URLSearchParams({ id: "1" });
    const result = buildIosSchemeUrlFromParams(config, "/item", params);
    expect(result).toBe("myapp://item?id=1");
  });
});

describe("buildAppSchemeParams", () => {
  it("converts search params and adds path", () => {
    const result = buildAppSchemeParams({ id: "1", name: "test" }, "/item");
    expect(result.get("id")).toBe("1");
    expect(result.get("name")).toBe("test");
    expect(result.get("path")).toBe("/item");
  });

  it("omits path when undefined", () => {
    const result = buildAppSchemeParams({ id: "1" }, undefined);
    expect(result.has("path")).toBe(false);
  });
});

describe("buildAndroidStoreUrl", () => {
  it("builds Play Store URL with referrer", () => {
    const result = buildAndroidStoreUrl(config, "https://www.example.com/action/item?id=1");
    expect(result).toContain("play.google.com/store/apps/details");
    expect(result).toContain("id=com.example.app");
    expect(result).toContain("referrer=ddl%3D");
  });

  it("uses custom playStoreUrl when provided", () => {
    const customConfig = {
      ...config,
      android: { ...config.android, playStoreUrl: "https://play.google.com/store/apps/details?id=com.custom.app" },
    };
    const result = buildAndroidStoreUrl(customConfig, "https://www.example.com/action/item");
    expect(result).toContain("id=com.custom.app");
    expect(result).toContain("referrer=ddl%3D");
  });
});

describe("buildAndroidIntentUrl", () => {
  it("builds intent URL with package and fallback", () => {
    const storeUrl = "https://play.google.com/store/apps/details?id=com.example.app";
    const result = buildAndroidIntentUrl(config, "https://www.example.com/action/item?id=1", storeUrl);
    expect(result).toMatch(/^intent:\/\//);
    expect(result).toContain("package=com.example.app");
    expect(result).toContain("S.browser_fallback_url=");
    expect(result).toContain(";end");
  });
});
