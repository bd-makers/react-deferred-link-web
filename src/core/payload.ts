import type { DeepLinkConfig } from "./types";

/**
 * Build iOS pasteboard payload for deferred deep link recovery.
 *
 * Format: `<prefix><unix_timestamp>|<deep_link_url>`
 *
 * The app reads UIPasteboard on first launch, detects the prefix,
 * and routes to the encoded URL.
 */
export function buildIosPasteboardPayload(
  config: DeepLinkConfig,
  deepLinkUrl: string,
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `${config.ddlPrefix}${timestamp}|${deepLinkUrl}`;
}

/**
 * Build Android install referrer string for deferred deep link recovery.
 *
 * Format: `<referrerKey>=<encoded_url>`
 *
 * The app reads InstallReferrerClient on first launch and extracts
 * the deep link URL from the referrer.
 */
export function buildAndroidReferrer(
  config: DeepLinkConfig,
  deepLinkUrl: string,
): string {
  return `${config.ddlReferrerKey}=${encodeURIComponent(deepLinkUrl)}`;
}
