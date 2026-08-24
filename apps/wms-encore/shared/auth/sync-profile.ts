// Mirrors apps/wms-service's handleValidateToken.ts: on every token
// validation, the original JIT-provisioned/refreshed local `entities` and
// `users` rows from the core profile, then computed providerType/
// providerTypes (from the local `partnership` table) and fcm_token (from the
// local `user_fcm_token` table) to merge into the profile it returned.
//
// wms-encore's authHandler.ts originally skipped all of this ("this doesn't
// sync local entities/users tables" — see its header comment), which meant:
//   1. any entity/user first seen via login (not pre-provisioned through an
//      admin CRUD flow) never got a row in `entities`/`users` — every local
//      join against those tables (partnership, dashboard, users listings...)
//      silently drops it.
//   2. providerType/providerTypes/fcm_token in the profile returned to the
//      frontend (see auth.controller.ts's /set-auth) were never computed at
//      all, since core has no notion of WMS partnerships or FCM tokens.
//   3. user_is_active/entity_is_active were hardcoded to `true` rather than
//      reflecting the local row.
// This module ports that sync step, called from authHandler.ts on every
// cache miss (i.e. once per token TTL window, not every request).
import { sql } from "kysely";
import { db } from "../../db/db";
import * as entitiesRepo from "../../core/entities/entities.repository";
import * as usersRepo from "../../core/users/users.repository";
import * as fcmTokenRepo from "../../core/user-fcm-token/user-fcm-token.repository";
import type { CoreProfileResponse } from "./authHandler";

const TRANSPORTER_PROVIDER_TYPES = [
  "TRANSPORTER",
  "TRANSPORTER_RECYCLER",
  "TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER",
  "TRANSPORTER_LANDFILL",
  "TRANSPORTER_TREATMENT_PROVIDER",
  "TRANSPORTER_TREATMENT",
  "TRANSPORTER_GOVERNMENT",
  "SPECIALIZED_TREATMENT_PROVIDER",
  "TRANSPORTER_GOVERNMENT_WASTE_BANK",
] as const;

export interface SyncedProfileExtras {
  providerType: string | null;
  providerTypes: string | undefined;
  fcmToken: string | null;
  userIsActive: boolean;
  entityIsActive: boolean;
}

async function upsertEntity(profile: CoreProfileResponse): Promise<boolean> {
  const entity = profile.entity;
  const existing = await entitiesRepo.getEntityId(entity.id);

  if (!existing) {
    await entitiesRepo.createEntity({
      id: entity.id,
      name: entity.name,
      type: entity.type,
      address: entity.address,
      tag: entity.tag,
      provinceId: entity.province_id,
      regencyId: entity.regency_id,
      subDistrictId: entity.sub_district_id,
      villageId: entity.village_id,
      integrationType: entity.integration_type,
      location: entity.location,
      entityTypeId: entity.entity_type.id,
    });
    return true;
  }

  await entitiesRepo.refreshEntityFromProfile(entity.id, {
    tag: entity.tag,
    entityTypeId: entity.entity_type.id,
    provinceId: entity.province_id,
    regencyId: entity.regency_id,
  });
  return existing.isActive ?? true;
}

async function upsertUser(profile: CoreProfileResponse): Promise<boolean> {
  const existing = await usersRepo.findById(profile.id);

  await usersRepo.upsertFromProfile({
    id: profile.id,
    user_uuid: profile.user_uuid,
    entity_id: profile.entity_id,
    firstname: profile.firstname,
    lastname: profile.lastname,
    email: profile.email,
    username: profile.username,
    mobile_phone: profile.mobile_phone,
    gender: profile.gender,
    gender_label: profile.gender_label,
    date_of_birth: profile.date_of_birth,
    role: profile.role,
    role_id: profile.role_id,
    role_label: profile.role_label,
    view_only: profile.view_only === 1,
    status: profile.status,
    last_device: profile.last_device,
    keycloak_uuid: profile.keycloak_uuid,
    external_roles: (profile.external_roles ?? []).toString(),
    external_properties: profile.external_properties ? { ...profile.external_properties } : {},
    address: profile.address,
    manufacture_id: profile.manufacture_id,
    village_id: profile.village_id,
    last_login: profile.last_login,
    created_by: profile.created_by,
    updated_by: profile.updated_by,
  });

  return existing?.isActive ?? true;
}

// Mirrors handleValidateToken.ts's single PartnershipModel.findOne lookup for
// the singular `providerType` field: any partnership row where this entity is
// the provider, restricted to the same transporter-ish provider types.
async function getProviderType(entityId: number): Promise<string | null> {
  const row = await db
    .selectFrom("partnership")
    .select("provider_type")
    .where("provider_id", "=", entityId)
    .where("provider_type", "in", TRANSPORTER_PROVIDER_TYPES)
    .orderBy("id", "asc")
    .executeTakeFirst();
  return row?.provider_type ?? null;
}

// Mirrors handleValidateToken.ts's raw GROUP_CONCAT/CONCAT_WS query for the
// aggregate `providerTypes` field. Ported to Postgres as two independent
// subqueries (string_agg + an EXISTS check) rather than the original's single
// LEFT JOIN + GROUP BY — the original's GROUP BY named no columns at all,
// which MySQL tolerates by picking one arbitrary `pt.provider_type` per
// implicit whole-table group; Postgres has no equivalent loose-grouping
// behavior, and an EXISTS check is the correct restatement of "is there any
// row at all", not merely "the same net result restated".
async function getProviderTypes(entityId: number): Promise<string | undefined> {
  const aggResult = await sql<{ types: string | null }>`
    SELECT string_agg(DISTINCT provider_type, ', ' ORDER BY provider_type) AS types
    FROM partnership
    WHERE provider_id = ${entityId} AND partnership_status = 'ACTIVE'
  `.execute(db);

  const governmentWasteBankResult = await sql<{ id: number }>`
    SELECT pt.id
    FROM partnership p
    JOIN partnership pt
      ON pt.provider_id = p.transporter_id
      AND pt.consumer_id = p.consumer_id
      AND pt.provider_type = 'TRANSPORTER_GOVERNMENT_WASTE_BANK'
      AND pt.partnership_status = 'ACTIVE'
    WHERE p.provider_id = ${entityId} AND p.partnership_status = 'ACTIVE'
    LIMIT 1
  `.execute(db);

  const parts = [
    aggResult.rows[0]?.types ?? undefined,
    governmentWasteBankResult.rows.length > 0 ? "GOVERNMENT_WASTE_BANK" : undefined,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(", ") : undefined;
}

async function getFcmToken(profile: CoreProfileResponse): Promise<string | null> {
  const row = await fcmTokenRepo.findByIdentity(profile.user_uuid, profile.entity_id);
  return row?.token ?? null;
}

export async function syncProfileLocally(profile: CoreProfileResponse): Promise<SyncedProfileExtras> {
  const [entityIsActive, userIsActive, providerType, providerTypes, fcmToken] = await Promise.all([
    upsertEntity(profile),
    upsertUser(profile),
    getProviderType(profile.entity_id),
    getProviderTypes(profile.entity_id),
    getFcmToken(profile),
  ]);

  return { providerType, providerTypes, fcmToken, userIsActive, entityIsActive };
}
