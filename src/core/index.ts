export type {
  DeepLinkConfig,
  Platform,
  UtmParams,
} from "./types";

export { detectPlatform, detectPlatformClient } from "./platform";
export { buildIosPasteboardPayload, buildAndroidReferrer } from "./payload";
export {
  isAllowedHost,
  buildDeepLinkUrl,
  buildIosSchemeUrl,
  buildIosSchemeUrlFromParams,
  buildAppSchemeParams,
  buildAndroidStoreUrl,
  buildAndroidIntentUrl,
} from "./url";
export { extractUtmParams } from "./utm";
export type {
  DeepLinkEvent,
  DeepLinkEventPayload,
  DeepLinkTracker,
} from "./analytics";
export { defaultTracker } from "./analytics";
