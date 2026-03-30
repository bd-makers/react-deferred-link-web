import type { Platform } from "./types";

export function detectPlatform(userAgent: string | null): Platform {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (ua.includes("android")) return "android";
  if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ipod") ||
    ua.includes("ios")
  ) {
    return "ios";
  }
  return "desktop";
}

export function detectPlatformClient(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  return detectPlatform(navigator.userAgent);
}
