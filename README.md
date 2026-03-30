# react-deferred-link-web

Deferred deep link landing page for React / Next.js apps.

A self-hosted alternative to Firebase Dynamic Links — supports **iOS pasteboard** and **Android install referrer** based deferred deep link recovery.

## What it does

When a user clicks a shared link (e.g. `https://example.com/action/item?id=123`):

1. **App installed** — opens the app directly via custom scheme (iOS) or intent URL (Android)
2. **App not installed** — redirects to App Store / Google Play with deferred link payload
3. **Desktop** — shows download links for both stores

### Deferred recovery

| Platform | Mechanism | Format |
|----------|-----------|--------|
| iOS | UIPasteboard | `<prefix><timestamp>\|<url>` |
| Android | InstallReferrerClient | `<key>=<encoded_url>` |

The app reads the payload on first launch and routes to the original deep link destination.

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure

Copy the example config:

```bash
cp deeplink.config.example.ts deeplink.config.ts
```

Edit `deeplink.config.ts` with your app's values:

```ts
export const config: DeepLinkConfig = {
  allowedHosts: ["example.com", "www.example.com"],
  canonicalHost: "www.example.com",
  ddlPrefix: "myapp:ddl:",
  ddlReferrerKey: "ddl",
  ios: {
    appScheme: "myapp://",
    appStoreUrl: "https://apps.apple.com/app/id0000000000",
  },
  android: {
    packageId: "com.example.app",
  },
  webFallbackUrl: "https://www.example.com",
};
```

### 3. Set up App Links verification

**Android** — `public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.example.app",
    "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
  }
}]
```

**iOS** — `public/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "TEAMID.com.example.app",
      "paths": ["*"]
    }]
  }
}
```

### 4. Create the landing page

Create `app/action/[...slug]/page.tsx`:

```tsx
import { headers } from "next/headers";
import { config } from "@/deeplink.config";
import {
  detectPlatform,
  isAllowedHost,
  extractUtmParams,
  buildDeepLinkUrl,
  buildIosPasteboardPayload,
  buildIosSchemeUrl,
  buildIosSchemeUrlFromParams,
  buildAppSchemeParams,
  buildAndroidStoreUrl,
  buildAndroidIntentUrl,
} from "react-deferred-link-web";
import {
  DeepLinkIosClient,
  DeepLinkAndroidClient,
  DeepLinkDesktopPage,
} from "react-deferred-link-web/react";
import { RAW_SEARCH_HEADER } from "react-deferred-link-web/nextjs";

export default async function Page({ params, searchParams }) {
  const [{ slug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const headersList = await headers();
  const ua = headersList.get("user-agent");
  const platform = detectPlatform(ua);

  const path = slug ? `/${slug.join("/")}` : undefined;
  const prefix = config.routePrefix ?? "/action";
  const utmParams = extractUtmParams(resolvedSearch);
  const rawSearch = headersList.get(RAW_SEARCH_HEADER) ?? "";
  const deepLinkUrl = rawSearch
    ? `https://${config.canonicalHost}${prefix}${path ?? ""}${rawSearch}`
    : buildDeepLinkUrl(config.canonicalHost, prefix, path, resolvedSearch);

  if (platform === "android") {
    const storeUrl = buildAndroidStoreUrl(config, deepLinkUrl);
    return (
      <DeepLinkAndroidClient
        storeUrl={storeUrl}
        appDeepLinkUrl={buildAndroidIntentUrl(config, deepLinkUrl, storeUrl)}
        webFallbackUrl={config.webFallbackUrl}
        platform={platform}
        path={path}
        utmParams={utmParams}
      />
    );
  }

  if (platform === "ios") {
    const appDeepLinkUrl = rawSearch
      ? buildIosSchemeUrl(config, path, rawSearch)
      : buildIosSchemeUrlFromParams(config, path, buildAppSchemeParams(resolvedSearch, path));
    return (
      <DeepLinkIosClient
        appStoreUrl={config.ios.appStoreUrl}
        payloadText={buildIosPasteboardPayload(config, deepLinkUrl)}
        appDeepLinkUrl={appDeepLinkUrl}
        webFallbackUrl={config.webFallbackUrl}
        platform={platform}
        path={path}
        utmParams={utmParams}
      />
    );
  }

  return (
    <DeepLinkDesktopPage
      androidStoreUrl={buildAndroidStoreUrl(config, deepLinkUrl)}
      iosStoreUrl={config.ios.appStoreUrl}
      platform={platform}
      path={path}
      utmParams={utmParams}
    />
  );
}
```

### 5. Set up middleware

```ts
// middleware.ts
import { withRawSearch } from "react-deferred-link-web/nextjs";

export function middleware(request) {
  return withRawSearch(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|\\.well-known).*)"],
};
```

## Custom UI with render props

Components accept a `children` render prop for full UI control:

```tsx
<DeepLinkIosClient {...props}>
  {({ phase, handleStoreRedirect, handleWebFallback }) => (
    <div>
      {phase === "opening" && <p>Opening app...</p>}
      {phase === "not-installed" && (
        <>
          <button onClick={handleStoreRedirect}>Download</button>
          <button onClick={handleWebFallback}>Web</button>
        </>
      )}
    </div>
  )}
</DeepLinkIosClient>
```

## Custom analytics

Pass a `tracker` function to components:

```tsx
const myTracker = (payload) => {
  gtag("event", payload.event, payload);
};

<DeepLinkIosClient tracker={myTracker} {...props} />
```

## Architecture

```
src/
├── core/           # Pure functions (no React dependency)
│   ├── types.ts    # DeepLinkConfig, Platform, UtmParams
│   ├── platform.ts # UA-based platform detection
│   ├── payload.ts  # iOS pasteboard & Android referrer builders
│   ├── url.ts      # Intent URL, scheme URL, store URL builders
│   ├── utm.ts      # UTM parameter extraction
│   └── analytics.ts # Event types & default tracker
├── react/          # React components
│   ├── DeepLinkIosClient.tsx
│   ├── DeepLinkAndroidClient.tsx
│   └── DeepLinkDesktopPage.tsx
└── nextjs/         # Next.js helpers
    └── middleware.ts # Raw query string preservation
```

## How it works

### iOS flow

1. Landing page attempts to open app via custom scheme (`myapp://path`)
2. If app doesn't open within 2.5s → show "not installed" UI
3. User taps "Download" → clipboard payload is written → redirect to App Store
4. App reads `UIPasteboard` on first launch → detects prefix → routes to destination

> iOS Safari requires a **user gesture** for clipboard access. The payload is copied on button tap, not automatically.

### Android flow

1. Landing page navigates to `intent://` URL with package name + fallback
2. If app is installed → opens via App Links / intent filter
3. If not installed → browser follows `S.browser_fallback_url` to Play Store
4. Play Store URL includes `referrer=ddl=<encoded_url>`
5. App reads `InstallReferrerClient` on first launch → extracts `ddl=` → routes to destination

## Companion library

This is the **web (sender)** side. For the **app (receiver)** side, see:

- [react-native-deferred-link](https://github.com/user/react-native-deferred-link) — React Native library for reading pasteboard / install referrer payloads

## License

MIT
