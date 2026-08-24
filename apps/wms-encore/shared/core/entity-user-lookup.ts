// Ports the *display-name* half of apps/wms-service's
// infrastructure/external-apis/thirdPartyClient.ts's getEntityDetail/
// getUsersDetail: dozens of repository/service functions across this port
// (manual-scale-request, partnership, entity-location, waste-source,
// qr-code-config, ...) have a documented TODO reading roughly "populate
// entityName/operatorName/userName/providerName via getEntityDetail(...)/
// getUsersDetail(...) once a core client exists".
//
// The original's own lookup order was itself local-DB-first, HTTP-fallback-
// second (Redis cache -> local EntitiesModel/UsersModel row -> only on a
// miss, an HTTP call to core). Since shared/auth/sync-profile.ts now
// JIT-provisions this port's own local `entities`/`users` tables on every
// login (see that module's header comment), the local-DB-first branch alone
// now covers the same cases the original's local branch covered — anyone
// who has ever authenticated already has a row here.
//
// What's NOT ported is the HTTP-fallback branch: doing that faithfully would
// require threading a bearer token down through every one of these call
// chains (most are several layers deep in repository code, well past the
// controller that has the token), which is a much larger, separate refactor.
// So this module is local-only: a genuine miss (an id referencing an
// entity/user that has never authenticated here) returns `undefined`, same
// externally-visible fallback behavior as the original's swallowed-HTTP-
// error case, just via a different path to the same "missing" outcome.
import { getEntityId } from "../../core/entities/entities.repository";
import { findById, findByUserUuid } from "../../core/users/users.repository";

export async function getLocalEntityName(entityId: number | null | undefined): Promise<string | undefined> {
  if (!entityId) return undefined;
  const entity = await getEntityId(entityId);
  return entity?.name;
}

function displayName(user: { firstname?: string; lastname?: string; username?: string }): string | undefined {
  return [user.firstname, user.lastname].filter(Boolean).join(" ") || user.username;
}

// Accepts either a numeric users.id or a users.user_uuid string — most call
// sites in this port carry the requesting/processing user as a UUID
// (mirrors the original's mixed usage of user_uuid vs numeric id across
// different tables/columns).
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Some callers carry legacy/seed values (varchar columns, not FK-constrained
// to users.id/user_uuid) that are neither a numeric id nor a valid UUID —
// e.g. waste_hierarchy.updated_by is just varchar(32). Those must resolve to
// "unknown" rather than being passed to a UUID-typed column comparison,
// which Postgres rejects outright (22P02) instead of just returning no rows.
export async function getLocalUserName(userIdOrUuid: number | string | null | undefined): Promise<string | undefined> {
  if (!userIdOrUuid) return undefined;

  if (typeof userIdOrUuid === "number" || /^\d+$/.test(userIdOrUuid)) {
    const user = await findById(Number(userIdOrUuid));
    return user ? displayName(user) : undefined;
  }

  if (!UUID_PATTERN.test(userIdOrUuid)) return undefined;

  const user = await findByUserUuid(userIdOrUuid);
  return user ? displayName(user) : undefined;
}
