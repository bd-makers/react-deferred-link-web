export type DeepLinkEvent =
  | "deep_link_landing"
  | "deep_link_copy_payload"
  | "deep_link_open_app"
  | "deep_link_store_redirect"
  | "deep_link_web_fallback";

export interface DeepLinkEventPayload {
  event: DeepLinkEvent;
  platform: "ios" | "android" | "desktop";
  path?: string;
  campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export type DeepLinkTracker = (payload: DeepLinkEventPayload) => void;

/**
 * Default tracker that logs to console in development.
 * Replace with your own tracker (GA4, Amplitude, etc.) via config.
 */
export const defaultTracker: DeepLinkTracker = (payload) => {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "development") {
    console.log("[DeepLink]", payload);
  }
};
