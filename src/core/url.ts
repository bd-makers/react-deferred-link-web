import type { DeepLinkConfig } from "./types";
import { buildAndroidReferrer } from "./payload";

type SearchParams = Record<string, string | string[] | undefined>;

export function isAllowedHost(config: DeepLinkConfig, host: string): boolean {
  return config.allowedHosts.some(
    (h) => h.toLowerCase() === host.toLowerCase(),
  );
}

export function buildDeepLinkUrl(
  canonicalHost: string,
  routePrefix: string,
  path: string | undefined,
  searchParams: SearchParams,
): string {
  const baseUrl = `https://${canonicalHost}${routePrefix}${path ?? ""}`;
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) params.append(key, v);
      });
    } else if (typeof value === "string") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

export function buildIosSchemeUrl(
  config: DeepLinkConfig,
  path: string | undefined,
  rawSearch: string,
): string {
  const base = config.ios.appScheme.replace(/\/$/, "");
  const pathPart = path ?? "";
  const pathNormalized = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  return `${base}${pathNormalized}${rawSearch}`;
}

export function buildIosSchemeUrlFromParams(
  config: DeepLinkConfig,
  path: string | undefined,
  payloadParams: URLSearchParams,
): string {
  const base = config.ios.appScheme.replace(/\/$/, "");
  const pathPart = path ?? "";
  const query = payloadParams.toString();
  const separator = pathPart.includes("?") ? "&" : "?";
  const fullPath = query ? `${pathPart}${separator}${query}` : pathPart;
  const pathNormalized = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
  return `${base}${pathNormalized}`;
}

export function buildAppSchemeParams(
  searchParams: SearchParams,
  path: string | undefined,
): URLSearchParams {
  const payload = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) payload.append(key, v);
      });
    } else if (typeof value === "string") {
      payload.append(key, value);
    }
  });

  if (path) {
    payload.set("path", path);
  }

  return payload;
}

export function buildAndroidStoreUrl(
  config: DeepLinkConfig,
  deepLinkUrl: string,
): string {
  if (config.android.playStoreUrl) {
    const url = new URL(config.android.playStoreUrl);
    url.searchParams.set("referrer", buildAndroidReferrer(config, deepLinkUrl));
    return url.toString();
  }

  const url = new URL("https://play.google.com/store/apps/details");
  url.searchParams.set("id", config.android.packageId);
  url.searchParams.set("referrer", buildAndroidReferrer(config, deepLinkUrl));
  return url.toString();
}

export function buildAndroidIntentUrl(
  config: DeepLinkConfig,
  deepLinkUrl: string,
  storeUrl: string,
): string {
  const url = new URL(deepLinkUrl);
  const encodedFallback = encodeURIComponent(storeUrl);
  const scheme = url.protocol.replace(":", "");

  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${scheme};package=${config.android.packageId};S.browser_fallback_url=${encodedFallback};end`;
}
