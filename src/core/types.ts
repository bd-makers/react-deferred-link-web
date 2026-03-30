/**
 * Configuration for deferred deep link landing pages.
 */
export interface DeepLinkConfig {
  /** Allowed hostnames for security validation (e.g. ["example.com", "www.example.com"]) */
  allowedHosts: string[];

  /** Canonical hostname used in generated URLs (e.g. "www.example.com") */
  canonicalHost: string;

  /** Route prefix for deep link landing pages (default: "/action") */
  routePrefix?: string;

  /** iOS pasteboard payload prefix (e.g. "myapp:ddl:") */
  ddlPrefix: string;

  /** Android install referrer key (e.g. "ddl") */
  ddlReferrerKey: string;

  ios: {
    /** Custom URL scheme (e.g. "myapp://") */
    appScheme: string;
    /** App Store URL */
    appStoreUrl: string;
  };

  android: {
    /** Package ID (e.g. "com.example.app") */
    packageId: string;
    /** Play Store URL override (auto-generated if omitted) */
    playStoreUrl?: string;
  };

  /** Web fallback URL when user chooses "continue on web" */
  webFallbackUrl?: string;

  /** Fallback delay in ms before showing "not installed" UI (default: 2500) */
  fallbackDelayMs?: number;
}

export type Platform = "ios" | "android" | "desktop";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

export { UTM_KEYS };
