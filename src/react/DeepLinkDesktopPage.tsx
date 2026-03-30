import type { UtmParams } from "../core/types";

export interface DeepLinkDesktopPageProps {
  androidStoreUrl: string;
  iosStoreUrl: string;
  platform: "ios" | "android" | "desktop";
  path?: string;
  utmParams?: UtmParams;
  /** Render prop for full UI customization */
  children?: (props: DeepLinkDesktopRenderProps) => React.ReactNode;
}

export interface DeepLinkDesktopRenderProps {
  androidStoreUrl: string;
  iosStoreUrl: string;
}

export function DeepLinkDesktopPage({
  androidStoreUrl,
  iosStoreUrl,
  children,
}: DeepLinkDesktopPageProps) {
  if (children) {
    return <>{children({ androidStoreUrl, iosStoreUrl })}</>;
  }

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <p>Download the app</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
        <a href={androidStoreUrl}>Download from Google Play</a>
        <a href={iosStoreUrl}>Download from App Store</a>
      </div>
    </div>
  );
}
