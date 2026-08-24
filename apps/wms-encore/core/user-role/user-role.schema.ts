import { z } from "zod";

// The original userRoleController.ts/GetUserRole use-case never validate
// limit/page/search — they pass req.query straight through, and
// paginationUtils.sanitizePaginationParams() silently coerces anything
// non-positive-integer down to safe defaults (limit=10, page=1). There is no
// equivalent of a rejecting validator to port; this schema exists purely to
// document/mirror that sanitization step for reuse inside user-role.service.ts.
export const paginationParamsSchema = z.object({
  limit: z.number().int().positive().optional(),
  page: z.number().int().positive().optional(),
  search: z.string().optional(),
});

// Original: acceptLanguage?.toLowerCase().includes('en') ? 'en' : 'id' —
// anything not containing "en" (including undefined/missing header) falls
// back to 'id'. Preserved as-is in service.ts rather than via zod (it's a
// substring check, not a strict enum parse of the raw header value).
export const langSchema = z.enum(["en", "id"]);
