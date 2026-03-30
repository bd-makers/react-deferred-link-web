import type { DeepLinkConfig } from "./src/core/types";

/**
 * Example configuration — copy to `deeplink.config.ts` and adjust values.
 */
export const config: DeepLinkConfig = {
  // Allowed hostnames (security: only these hosts are accepted)
  allowedHosts: ["example.com", "www.example.com"],

  // Canonical host used in generated deep link URLs
  canonicalHost: "www.example.com",

  // Route prefix for landing pages (default: "/action")
  routePrefix: "/action",

  // iOS pasteboard payload prefix — app detects this on first launch
  ddlPrefix: "myapp:ddl:",

  // Android install referrer key — app reads this via InstallReferrerClient
  ddlReferrerKey: "ddl",

  ios: {
    // Custom URL scheme registered in your iOS app
    appScheme: "myapp://",
    // App Store URL for your app
    appStoreUrl: "https://apps.apple.com/app/id0000000000",
  },

  android: {
    // Package ID from your AndroidManifest.xml
    packageId: "com.example.app",
    // Optional: override full Play Store URL
    // playStoreUrl: "https://play.google.com/store/apps/details?id=com.example.app",
  },

  // Where "continue on web" button redirects to
  webFallbackUrl: "https://www.example.com",

  // Timeout before showing "not installed" UI (default: 2500ms)
  fallbackDelayMs: 2500,
};
