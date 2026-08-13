// Postgres column list for integration (mirrors
// apps/wms-service's infrastructure/database/models/UserFcmTokenModel.ts,
// which is `paranoid: true` — soft-deleted rows must stay excluded by
// query filters here, same as entity_location):
//
//   table: user_fcm_token
//   id            bigint unsigned  not null  auto_increment  primary key
//   user_id       int              not null
//   entity_id     int              not null
//   user_uuid     varchar(36)      not null
//   token         varchar(500)     not null
//   created_at    timestamp        not null  default now()
//   updated_at    timestamp        null
//   deleted_at    timestamp        null                        -- paranoid soft-delete
//   deleted_by    bigint           null
//   indexes: idx_user_uuid (user_uuid), idx_user_id (user_id)

import { db } from "../../db/db";
import type { UserFcmToken } from "./user-fcm-token.types";

function toEntity(row: {
  id: number;
  user_id: number;
  entity_id: number;
  user_uuid: string;
  token: string;
  created_at: Date;
  updated_at: Date | null;
}): UserFcmToken {
  return {
    id: row.id,
    userId: row.user_id,
    entityId: row.entity_id,
    userUuid: row.user_uuid,
    token: row.token,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

// Mirrors UserFcmTokenRepositoryImpl.getTokenByUserId: matches on
// (user_uuid = id OR user_id = id) AND entity_id = entityId — the original
// Sequelize `Op.or` compares `id` (a string) against the numeric `userId`
// column too, letting Sequelize coerce it; Number(id) here preserves that
// same "id may be either the uuid or the numeric id" lookup.
export async function findByIdentity(
  id: string,
  entityId: number,
): Promise<UserFcmToken | null> {
  const row = await db
    .selectFrom("user_fcm_token")
    .selectAll()
    .where((eb) => (id ? eb.or([eb("user_uuid", "=", id), eb("user_id", "=", Number(id))]) : eb("user_id", "=", Number(id))))
    .where("entity_id", "=", entityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors UserFcmTokenRepositoryImpl.createOrUpdateToken: looks up the
// existing row by the exact (user_uuid, user_id, entity_id) triple; updates
// its token + updated_at if found, otherwise inserts a new row.
export async function createOrUpdateToken(payload: {
  userId: number;
  entityId: number;
  userUuid: string;
  token: string;
}): Promise<UserFcmToken> {
  const existing = await db
    .selectFrom("user_fcm_token")
    .selectAll()
    .where("user_uuid", "=", payload.userUuid)
    .where("user_id", "=", payload.userId)
    .where("entity_id", "=", payload.entityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();

  if (existing) {
    const updated = await db
      .updateTable("user_fcm_token")
      .set({ token: payload.token, updated_at: new Date() })
      .where("id", "=", existing.id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return toEntity(updated);
  }

  const created = await db
    .insertInto("user_fcm_token")
    .values({
      user_id: payload.userId,
      entity_id: payload.entityId,
      user_uuid: payload.userUuid,
      token: payload.token,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(created);
}
