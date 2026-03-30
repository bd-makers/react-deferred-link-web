import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware helper that preserves the raw query string.
 *
 * Next.js URLSearchParams re-encodes query strings, which corrupts
 * nested URLs (e.g. `?https://example.com/path`). This middleware
 * captures the original query string in an `x-raw-search` header
 * so the page can reconstruct the exact deep link URL.
 *
 * Usage in your middleware.ts:
 * ```ts
 * import { withRawSearch } from "react-deferred-link-web/nextjs";
 *
 * export function middleware(request: NextRequest) {
 *   return withRawSearch(request);
 * }
 * ```
 */
export function withRawSearch(
  request: NextRequest,
  response?: NextResponse,
): NextResponse {
  const res = response ?? NextResponse.next();
  const rawSearch = request.nextUrl.search;
  if (rawSearch) {
    res.headers.set("x-raw-search", rawSearch);
  }
  return res;
}

export const RAW_SEARCH_HEADER = "x-raw-search";
