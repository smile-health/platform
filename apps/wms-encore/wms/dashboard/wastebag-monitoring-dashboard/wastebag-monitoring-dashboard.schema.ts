// Mirrors apps/wms-service's src/utils/boolean.ts's parseBoolean(), used by
// every controller in wasteBagMonitoringDashboardController.ts as:
//   if (isBags) isBagsBool = parseBoolean(isBags.toString());
// i.e. an unrecognized string silently becomes `undefined` (falls through to
// the weight-based branch downstream) — no validation error is ever thrown
// for a malformed isBags value anywhere in the original module. Preserved
// as-is here; there is no zod schema in this module because the original
// use-cases/repository never validate their inputs (see service.ts comment).
export {};

const TRUE_SET = new Set(["1", "true", "yes", "y", "on"]);
const FALSE_SET = new Set(["0", "false", "no", "n", "off"]);

export function parseBoolean(input?: string): boolean | undefined {
  if (input == null) return undefined;
  const s = input.trim().toLowerCase();
  if (TRUE_SET.has(s)) return true;
  if (FALSE_SET.has(s)) return false;
  return undefined;
}

// Mirrors the controller's:
//   const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
//   const lang = acceptLanguage.includes('en') ? 'en' : 'id';
export function resolveLang(acceptLanguage?: string): "en" | "id" {
  const normalized = (acceptLanguage ?? "").toLowerCase();
  return normalized.includes("en") ? "en" : "id";
}
