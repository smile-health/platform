// Ported from apps/wms-service's interfaces/http/middlewares/authorizeRoles.ts —
// only the role-tier semantics (allRead/onlyAdmin), NOT authorizeRoles()'s
// Express middleware wrapper (this port has no route-middleware layer) and
// NOT its Title-Case role-name vocabulary.
//
// authorizeRoles.ts itself never enforces anything in production: its
// `hasRole` check builds `userRoles` from a hardcoded literal containing
// every role in its list (the line that would derive it from the real user —
// `user.external_properties.roles` — is commented out), so the intended
// check is that literal role.type field, not the Title-Case per-entity-type
// names authorizeRoles.ts's own dead list enumerates. shared/auth/authHandler.ts's
// AuthData.role carries that real value (apps/core's external_properties.role.type,
// e.g. "super_admin"/"admin"/"manager"/"operator_landfill"/"sanitarian" — the
// same vocabulary already used by this port's own isSuperAdminRole-style
// checks elsewhere, e.g. waste-treatment-external-group.service.ts's
// ALLOWED_OPERATOR_ROLES). Real enforcement below is built on that field.
//
// allRead's old list covered literally every role the original's enum had —
// i.e. "any authenticated user with a real role" — so it maps to "any
// recognized tier". onlyAdmin's old list was the entity-side "Admin ___"
// roles only (excluding the Dinkes/Kemenkes government "Manager"/"Admin"/
// "Operator" roles, which are a separate role family) — mapped to
// super_admin/admin, excluding manager.
export type RoleTier = "allRead" | "onlyAdmin";
export const allRead: RoleTier = "allRead";
export const onlyAdmin: RoleTier = "onlyAdmin";

function isSuperAdminRole(role: string): boolean {
  return role === "super_admin";
}
function isAdminRole(role: string): boolean {
  return role === "admin" || role === "manager";
}
function isOperatorRole(role: string): boolean {
  return role === "sanitarian" || role.startsWith("operator");
}
function isRecognizedRole(role: string): boolean {
  return isSuperAdminRole(role) || isAdminRole(role) || isOperatorRole(role);
}

import { APIError, ErrCode } from "encore.dev/api";

// Mirrors authorizeRoles(allowedRoles)'s `hasRole` test's real intent (not
// its dead-code implementation): throws the same "Forbidden: Access denied"
// the original's res.fail(..., { isForbiddenError: true }) produced, mapped
// to PermissionDenied (403).
export function assertRole(role: string | undefined, tier: RoleTier): void {
  if (!role || !isRecognizedRole(role)) {
    throw new APIError(ErrCode.PermissionDenied, "Forbidden: Access denied");
  }
  if (tier === "onlyAdmin" && !(isSuperAdminRole(role) || role === "admin")) {
    throw new APIError(ErrCode.PermissionDenied, "Forbidden: Access denied");
  }
}
