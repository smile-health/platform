import * as repo from "./user-role.repository";
import type { GetAllUserRoleInput, PaginatedUserRoles } from "./user-role.types";

// userRoleController.ts/GetUserRole.ts never call res.fail(...) at all (no
// isXError flags anywhere in this module) — the only error path is the
// use-case's own try/catch around the repository call, which swallows the
// original error and rethrows a plain, un-flagged `Error('Error fetching all
// user role')`. The controller's outer catch then does res.error(...) -> a
// generic 500 envelope. Preserved here as a plain Error (not an APIError),
// matching the "un-flagged Error -> 500" convention used elsewhere in this
// port (see entity-location.service.ts).

function sanitizePaginationParams(limit?: number, page?: number): { limit: number; page: number } {
  // Mirrors shared/utils/pagination.ts paginationUtils.sanitizePaginationParams
  // (maxLimit default 1000, falls back to limit=10/page=1 for anything that
  // isn't a positive integer).
  const maxLimit = 1000;
  const safeLimit = Number.isInteger(limit) && (limit as number) > 0 ? Math.min(limit as number, maxLimit) : 10;
  const safePage = Number.isInteger(page) && (page as number) > 0 ? (page as number) : 1;
  return { limit: safeLimit, page: safePage };
}

function resolveLang(acceptLanguage?: string): string {
  // Original: `(req.headers['accept-language'] as string)?.toLowerCase() ||
  // 'id'` then `.includes('en') ? 'en' : 'id'` — missing header, or a header
  // that doesn't contain "en", both fall back to 'id'.
  const normalized = acceptLanguage?.toLowerCase() ?? "id";
  return normalized.includes("en") ? "en" : "id";
}

export async function getAllUserRole(input: GetAllUserRoleInput): Promise<PaginatedUserRoles> {
  const { limit, page } = sanitizePaginationParams(input.limit, input.page);
  const lang = resolveLang(input.lang);

  try {
    return await repo.findPaginated({
      limit,
      page,
      search: input.search,
      lang,
    });
  } catch {
    // GetUserRole.ts: `throw new Error('Error fetching all user role')`
    throw new Error("Error fetching all user role");
  }
}
