"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { DeepLinkEventPayload, DeepLinkTracker } from "../core/analytics";
import { defaultTracker } from "../core/analytics";
import type { UtmParams } from "../core/types";

export interface DeepLinkAndroidClientProps {
  storeUrl: string;
  appDeepLinkUrl: string;
  webFallbackUrl?: string;
  platform: "ios" | "android" | "desktop";
  path?: string;
  utmParams?: UtmParams;
  fallbackDelayMs?: number;
  tracker?: DeepLinkTracker;
  /** Render prop for full UI customization */
  children?: (props: DeepLinkAndroidRenderProps) => React.ReactNode;
}

export interface DeepLinkAndroidRenderProps {
  phase: "opening" | "not-installed";
  handleStoreRedirect: () => void;
  handleWebFallback: () => void;
}

const DEFAULT_FALLBACK_DELAY_MS = 2500;

export function DeepLinkAndroidClient({
  storeUrl,
  appDeepLinkUrl,
  webFallbackUrl,
  platform,
  path,
  utmParams,
  fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS,
  tracker = defaultTracker,
  children,
}: Readonly<DeepLinkAndroidClientProps>) {
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = useState<"opening" | "not-installed">("opening");

  const buildEventPayload = useCallback(
    (event: DeepLinkEventPayload["event"]): DeepLinkEventPayload => ({
      event,
      platform,
      path,
      ...utmParams,
    }),
    [platform, path, utmParams],
  );

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    tracker(buildEventPayload("deep_link_landing"));
    tracker(buildEventPayload("deep_link_open_app"));

    fallbackTimerRef.current = setTimeout(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        setPhase("not-installed");
      }
    }, fallbackDelayMs);

    globalThis.location.href = appDeepLinkUrl;

    return clearFallbackTimer;
  }, [buildEventPayload, appDeepLinkUrl, clearFallbackTimer, fallbackDelayMs, tracker]);

  const handleWebFallback = useCallback(() => {
    tracker(buildEventPayload("deep_link_web_fallback"));
    if (webFallbackUrl) {
      globalThis.location.href = webFallbackUrl;
    }
  }, [buildEventPayload, webFallbackUrl, tracker]);

  const handleStoreRedirect = useCallback(() => {
    tracker(buildEventPayload("deep_link_store_redirect"));
    globalThis.location.href = storeUrl;
  }, [buildEventPayload, storeUrl, tracker]);

  if (children) {
    return <>{children({ phase, handleStoreRedirect, handleWebFallback })}</>;
  }

  if (phase === "opening") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Opening app...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>App is not installed.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
        <button type="button" onClick={handleStoreRedirect}>
          Download from Google Play
        </button>
        {webFallbackUrl && (
          <button type="button" onClick={handleWebFallback}>
            Continue on web
          </button>
        )}
      </div>
    </div>
  );
}
