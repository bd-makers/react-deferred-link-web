import { UTM_KEYS, type UtmParams } from "./types";

export function extractUtmParams(
  searchParams: Record<string, string | string[] | undefined>,
): UtmParams {
  const result: UtmParams = {};
  for (const key of UTM_KEYS) {
    const val = searchParams[key];
    if (typeof val === "string") {
      result[key] = val;
    } else if (Array.isArray(val) && val[0]) {
      result[key] = val[0];
    }
  }
  return result;
}
