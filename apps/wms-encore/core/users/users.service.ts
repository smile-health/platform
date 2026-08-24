import { APIError, ErrCode } from "encore.dev/api";
import * as repo from "./users.repository";
import { updateUsersBodySchema } from "./users.schema";
import type { GetAllUsersInput, PaginatedUsers, User } from "./users.types";

// usersController.ts's updateUsers res.fail(...) call has no options object
// -> a plain 400 (FailedPrecondition). Its validateRequest(updateUsersSchema)
// middleware runs before the handler and uses isValidationError:true -> 422
// (InvalidArgument) on a malformed body — reproduced in updateUsers below via
// updateUsersBodySchema.safeParse.

function parseBoolean(input?: string | boolean | number): boolean | undefined {
  if (input === undefined || input === null) return undefined;
  if (typeof input === "boolean") return input;
  if (typeof input === "number") return input === 1;
  const s = input.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return undefined;
}

export async function getAllUsers(input: GetAllUsersInput): Promise<PaginatedUsers | User | null> {
  // Original (GetAllUsersUseCase.execute): resolvedUserId is the caller's own
  // id for a non-super-admin, or the raw `userId` query param for a
  // super_admin. If the caller is a super_admin AND no userId was supplied,
  // it runs the full filtered+paginated list. Otherwise it looks up exactly
  // one user by id (ignoring every other filter) — this covers both a
  // non-super-admin (whose resolvedUserId is always their own id) and a
  // super_admin who explicitly passed a userId.
  const resolvedUserId = input.isSuperAdmin ? input.userId : input.callerUserId;

  if (input.isSuperAdmin && resolvedUserId === undefined) {
    // NOTE: the original also accepts `entityTypeId` as a filter here
    // (`whereClause['entity_type_id'] = entityTypeId`), but UsersModel/the
    // `users` table has no `entity_type_id` column — that branch is dead code
    // in the original (would error if ever hit with a truthy entityTypeId).
    // Not reproduced here; entityTypeId is accepted on the wire but ignored,
    // same effective behavior as the original's never-taken success path.
    //
    // `groupBy`/`attributes` are Sequelize-specific projection/aggregation
    // knobs with no Kysely equivalent in this fixed repository shape — also
    // accepted on the wire but ignored (TODO if a caller actually needs
    // them).
    const safeLimit = input.limit && input.limit > 0 ? input.limit : 10;
    const safePage = input.page && input.page > 0 ? input.page : 1;
    return repo.findPaginated({
      limit: safeLimit,
      page: safePage,
      entityId: input.entityId,
      search: input.search,
      provinceId: input.provinceId,
      regencyId: input.regencyId,
      role: input.role,
      isActive: parseBoolean(input.isActive),
    });
  }

  if (resolvedUserId) {
    // Original: GetUsersByIdUseCase returns null on not-found, and the
    // controller responds res.success(null) — preserved as-is (a successful
    // null, not an error).
    return repo.findById(resolvedUserId);
  }

  // Original: `throw new Error('User ID is required for non-super-admin
  // user')` — a plain, un-flagged Error inside the use-case's own try/catch,
  // rethrown, caught by the controller's outer catch -> res.error(...) -> 500.
  // Practically unreachable (an authenticated caller always has an id), kept
  // for parity as an Internal error rather than a 4xx.
  throw new APIError(ErrCode.Internal, "User ID is required for non-super-admin user");
}

export async function updateUsers(id: string, isActive: unknown): Promise<User> {
  if (!id) {
    // res.fail('ID parameter is required') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }

  const parsed = updateUsersBodySchema.safeParse({ is_active: isActive });
  if (!parsed.success) {
    // validateRequest middleware -> isValidationError:true -> 422
    throw new APIError(ErrCode.InvalidArgument, parsed.error.issues[0]?.message ?? "Invalid request");
  }

  const updated = await repo.updateStatus(numericId, parsed.data.is_active);
  if (!updated) {
    // res.fail('Users not found') — no flag
    throw new APIError(ErrCode.FailedPrecondition, "Users not found");
  }
  return updated;
}
