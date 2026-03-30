"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { DeepLinkEventPayload, DeepLinkTracker } from "../core/analytics";
import { defaultTracker } from "../core/analytics";
import type { UtmParams } from "../core/types";

export interface DeepLinkIosClientProps {
  appStoreUrl: string;
  payloadText: string;
  appDeepLinkUrl?: string;
  webFallbackUrl?: string;
  platform: "ios" | "android" | "desktop";
  path?: string;
  utmParams?: UtmParams;
  fallbackDelayMs?: number;
  tracker?: DeepLinkTracker;
  /** Render prop for full UI customization */
  children?: (props: DeepLinkIosRenderProps) => React.ReactNode;
}

export interface DeepLinkIosRenderProps {
  phase: "opening" | "not-installed";
  handleStoreRedirect: () => Promise<void>;
  handleWebFallback: () => void;
}

const DEFAULT_FALLBACK_DELAY_MS = 2500;

export function DeepLinkIosClient({
  appStoreUrl,
  payloadText,
  appDeepLinkUrl,
  webFallbackUrl,
  platform,
  path,
  utmParams,
  fallbackDelayMs = DEFAULT_FALLBACK_DELAY_MS,
  tracker = defaultTracker,
  children,
}: Readonly<DeepLinkIosClientProps>) {
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

  const copyPayload = useCallback(async () => {
    if (!payloadText) return;
    try {
      await globalThis.navigator.clipboard.writeText(payloadText);
      tracker(buildEventPayload("deep_link_copy_payload"));
    } catch {
      void 0;
    }
  }, [payloadText, buildEventPayload, tracker]);

  useEffect(() => {
    tracker(buildEventPayload("deep_link_landing"));
    tracker(buildEventPayload("deep_link_open_app"));

    if (appDeepLinkUrl) {
      fallbackTimerRef.current = setTimeout(() => {
        if (
          typeof document !== "undefined" &&
          document.visibilityState === "visible"
        ) {
          setPhase("not-installed");
        }
      }, fallbackDelayMs);

      globalThis.location.href = appDeepLinkUrl;
    } else {
      globalThis.setTimeout(() => setPhase("not-installed"), 150);
    }

    return clearFallbackTimer;
  }, [buildEventPayload, appDeepLinkUrl, clearFallbackTimer, fallbackDelayMs, tracker]);

  const handleWebFallback = useCallback(() => {
    tracker(buildEventPayload("deep_link_web_fallback"));
    if (webFallbackUrl) {
      globalThis.location.href = webFallbackUrl;
    }
  }, [buildEventPayload, webFallbackUrl, tracker]);

  const handleStoreRedirect = useCallback(async () => {
    await copyPayload();
    tracker(buildEventPayload("deep_link_store_redirect"));
    globalThis.location.href = appStoreUrl;
  }, [copyPayload, buildEventPayload, appStoreUrl, tracker]);

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
          Download from App Store
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
