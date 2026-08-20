import { db } from "../../db/db";
import { getEntityRegionNames } from "../../shared/core/entity-region-lookup";
import type { Entities, EntitiesPagination } from "./entities.types";

interface EntityRow {
  id: number;
  name: string | null;
  type: number | null;
  address: string | null;
  tag: string | null;
  province_id: string | null;
  regency_id: string | null;
  sub_district_id: string | null;
  village_id: string | null;
  integration_type: number | null;
  integration_client_id: number | null;
  location: string | null;
  external_properties: unknown | null;
  entity_type_id: number | null;
  code: string | null;
  nib: string | null;
  head_name: string | null;
  email: string | null;
  gender: number | null;
  mobile_phone: string | null;
  latitude: number | null;
  longitude: number | null;
  id_satu_sehat: number | null;
  total_bad_room: number | null;
  percentage_bad_room: number | null;
  is_active: boolean;
  updated_at: Date | null;
  // Only present when the query explicitly selects it (see the
  // `count_dongle` subquery in getEntityId/getAllEntities below).
  count_dongle?: string | number | null;
}

// `?? null` (not `?? undefined`) throughout: the old wms-service API returned
// an explicit `null` for every nullable field, and `undefined` values are
// dropped by JSON.stringify — silently removing the key from the response
// body. Preserving `null` keeps every key present, matching the original.
function toEntities(row: EntityRow): Entities {
  return {
    id: row.id,
    name: row.name ?? null,
    type: row.type ?? null,
    address: row.address ?? null,
    tag: row.tag ?? null,
    provinceId: row.province_id ?? null,
    regencyId: row.regency_id ?? null,
    subDistrictId: row.sub_district_id ?? null,
    villageId: row.village_id ?? null,
    integrationType: row.integration_type ?? null,
    integrationClientId: row.integration_client_id ?? null,
    location: row.location ?? null,
    externalProperties: (row.external_properties as Record<string, unknown> | null) ?? null,
    entityTypeId: row.entity_type_id ?? null,
    // TODO(entityTypeName/entityTypeIntegrationType/entityTypeExternalProperties):
    // see the note on Entities.entityTypeName in entities.types.ts — no source
    // to populate these from exists yet in this schema.
    code: row.code ?? null,
    nib: row.nib ?? null,
    headName: row.head_name ?? null,
    email: row.email ?? null,
    gender: row.gender ?? null,
    mobilePhone: row.mobile_phone ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    idSatuSehat: row.id_satu_sehat ?? null,
    totalBadRoom: row.total_bad_room ?? null,
    percentageBadRoom: row.percentage_bad_room ?? null,
    isActive: row.is_active,
    updatedAt: row.updated_at ?? null,
    countDongle: row.count_dongle !== undefined ? Number(row.count_dongle ?? 0) : null,
  };
}

// Resolves province_name/regency_name/district_name against the `regions`
// table. The old wms-service stored these as flat, separately-synced columns
// directly on `entities` (not a join) — that sync mechanism doesn't exist in
// this port, so names are resolved at read time instead via the same
// province_id/regency_id/sub_district_id -> regions.id lookup already used by
// getEntityRegionNames elsewhere in this codebase (shared/core/entity-region-lookup.ts).
async function enrichWithRegionNames(entity: Entities): Promise<Entities> {
  const names = await getEntityRegionNames({
    provinceId: entity.provinceId ?? undefined,
    regencyId: entity.regencyId ?? undefined,
    subDistrictId: entity.subDistrictId ?? undefined,
  });
  return {
    ...entity,
    provinceName: names.provinceName ?? null,
    regencyName: names.regencyName ?? null,
    districtName: names.districtName ?? null,
  };
}

// Correlated subquery mirroring the original's `COUNT(healthcareAssets.asset_id)`
// (EntitiesRepositoryImpl.getAllEntities, joined via EntitiesModel.hasMany(
// HealthcareAssetModel, { foreignKey: 'healthcareFacilityId' /* -> entity_id
// column */ }) — the original counted healthcare_asset.asset_id directly, not
// a join through asset_dongle, so non-null asset_id rows are what's counted
// here too. Soft-deleted healthcare_asset rows are excluded to match the
// model's paranoid default scope.
function withCountDongle<QB extends { select: (cb: (eb: any) => any) => QB }>(query: QB): QB {
  return query.select((eb: any) =>
    eb
      .selectFrom("healthcare_asset")
      .select((eb2: any) => eb2.fn.countAll().as("count"))
      .whereRef("healthcare_asset.entity_id", "=", "entities.id")
      .where("healthcare_asset.asset_id", "is not", null)
      .where("healthcare_asset.deleted_at", "is", null)
      .as("count_dongle")
  );
}

export async function getEntityId(entityId: number): Promise<Entities | null> {
  const row = await withCountDongle(
    db.selectFrom("entities").selectAll("entities").where("id", "=", entityId).where("deleted_at", "is", null)
  ).executeTakeFirst();
  return row ? enrichWithRegionNames(toEntities(row as EntityRow)) : null;
}

// Mirrors handleValidateToken.ts's EntitiesModel.create branch: JIT-provisions
// a local row the first time an entity is seen via auth, since (unlike the
// original wms-service) nothing else in this port creates entities rows —
// they only ever get updated (see updateEntity/updateStatusActiveEntities
// above). Without this, any entity that isn't already locally seeded never
// gets a row here, and every local join against `entities` (partnership,
// dashboard, users, ...) silently drops it.
export async function createEntity(data: {
  id: number;
  name?: string;
  type?: number;
  address?: string;
  tag?: string;
  provinceId?: string;
  regencyId?: string;
  subDistrictId?: string;
  villageId?: string;
  integrationType?: number;
  integrationClientId?: number;
  location?: string;
  entityTypeId?: number;
  code?: string;
  idSatuSehat?: number;
  latitude?: number;
  longitude?: number;
}): Promise<Entities> {
  const row = await db
    .insertInto("entities")
    .values({
      id: data.id,
      name: data.name ?? null,
      type: data.type ?? null,
      address: data.address ?? null,
      tag: data.tag ?? null,
      province_id: data.provinceId ?? null,
      regency_id: data.regencyId ?? null,
      sub_district_id: data.subDistrictId ?? null,
      village_id: data.villageId ?? null,
      integration_type: data.integrationType ?? null,
      integration_client_id: data.integrationClientId ?? null,
      location: data.location ?? null,
      entity_type_id: data.entityTypeId ?? null,
      code: data.code ?? null,
      id_satu_sehat: data.idSatuSehat ?? null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    })
    .onConflict((oc) => oc.column("id").doNothing())
    .returningAll()
    .executeTakeFirst();

  return row ? toEntities(row as EntityRow) : (await getEntityId(data.id))!;
}

// Mirrors handleValidateToken.ts's else-branch EntitiesModel.update: keeps a
// locally-seeded entity's mutable, frequently-changing fields fresh on every
// auth-cache-miss, same fields the original refreshed (tag/entity_type/code/
// province/regency/id_satu_sehat). Distinct from updateEntity above, which is
// the admin PATCH endpoint's explicit, caller-driven update.
export async function refreshEntityFromProfile(
  entityId: number,
  data: {
    tag?: string;
    entityTypeId?: number;
    code?: string;
    provinceId?: string;
    regencyId?: string;
    idSatuSehat?: number;
  }
): Promise<void> {
  await db
    .updateTable("entities")
    .set({
      tag: data.tag ?? null,
      entity_type_id: data.entityTypeId ?? null,
      code: data.code ?? null,
      province_id: data.provinceId ?? null,
      regency_id: data.regencyId ?? null,
      id_satu_sehat: data.idSatuSehat ?? null,
      updated_at: new Date(),
    })
    .where("id", "=", entityId)
    .execute();
}

export async function updateEntity(
  entityId: number,
  data: {
    nib?: string;
    mobilePhone?: string;
    headName?: string;
    email?: string;
    gender?: number;
    totalBadRoom?: number;
    percentageBadRoom?: number;
  }
): Promise<Entities | null> {
  const existing = await getEntityId(entityId);
  if (!existing) return null;

  await db
    .updateTable("entities")
    .set({
      updated_at: new Date(),
      nib: data.nib,
      mobile_phone: data.mobilePhone,
      head_name: data.headName,
      email: data.email,
      gender: data.gender,
      total_bad_room: data.totalBadRoom,
      percentage_bad_room: data.percentageBadRoom,
    })
    .where("id", "=", entityId)
    .execute();

  // Matches the original UpdateEntitiesUseCase/RepositoryImpl, which returns
  // the *input* payload back to the caller rather than re-reading the row
  // from the DB — carried over verbatim, not "fixed" here.
  return { ...existing, ...data };
}

export async function updateStatusActiveEntities(
  entityId: number,
  isActive: boolean
): Promise<Entities | null> {
  const existing = await getEntityId(entityId);
  if (!existing) return null;

  await db
    .updateTable("entities")
    .set({ is_active: isActive })
    .where("id", "=", entityId)
    .execute();

  return getEntityId(entityId);
}

export interface GetAllEntitiesParams {
  limit?: number;
  page?: number;
  entityTypeId?: number;
  entityId?: number;
  groupBy?: string[];
  attributes?: string[];
  search?: string;
  provinceId?: number;
  regencyId?: number;
  isActive?: boolean;
}

export async function getAllEntities(
  params: GetAllEntitiesParams
): Promise<{ data: Entities[]; pagination: EntitiesPagination }> {
  const safeLimit = params.limit && params.limit > 0 ? params.limit : 10;
  const safePage = params.page && params.page > 0 ? params.page : 1;
  const offset = (safePage - 1) * safeLimit;

  // Old model was `paranoid: true`, which auto-filtered soft-deleted rows out
  // of every query. Migration 4 dropped `deleted_at` entirely (see migration
  // 17, which adds it back), so without this filter soft-deleted entities
  // would leak into every list result — a correctness/security regression,
  // not just cosmetic.
  let baseQuery = db.selectFrom("entities").where("deleted_at", "is", null);
  let countQuery = db.selectFrom("entities").where("deleted_at", "is", null);

  if (params.entityTypeId !== undefined) {
    baseQuery = baseQuery.where("entity_type_id", "=", params.entityTypeId);
    countQuery = countQuery.where("entity_type_id", "=", params.entityTypeId);
  }
  if (params.entityId !== undefined) {
    baseQuery = baseQuery.where("id", "=", params.entityId);
    countQuery = countQuery.where("id", "=", params.entityId);
  }
  if (params.provinceId !== undefined) {
    baseQuery = baseQuery.where("province_id", "=", String(params.provinceId));
    countQuery = countQuery.where("province_id", "=", String(params.provinceId));
  }
  if (params.regencyId !== undefined) {
    baseQuery = baseQuery.where("regency_id", "=", String(params.regencyId));
    countQuery = countQuery.where("regency_id", "=", String(params.regencyId));
  }
  if (params.isActive !== undefined) {
    baseQuery = baseQuery.where("is_active", "=", params.isActive);
    countQuery = countQuery.where("is_active", "=", params.isActive);
  }
  if (params.search && params.search.trim() !== "") {
    const like = `%${params.search.trim()}%`;
    baseQuery = baseQuery.where("name", "ilike", like);
    countQuery = countQuery.where("name", "ilike", like);
  }

  const totalRow = await countQuery
    .select((eb) => eb.fn.countAll().as("total"))
    .executeTakeFirst();
  const total = Number(totalRow?.total ?? 0);

  // NOTE: the original EntitiesRepositoryImpl.getAllEntities also supports
  // arbitrary `groupBy`/`attributes` query params passed straight into a
  // Sequelize `group`/`attributes` clause. Kysely requires known columns, not
  // free-form strings from a query param, so that passthrough (an
  // unvalidated passthrough into Sequelize's query builder in the original)
  // is not reproduced here. `count_dongle` *is* reproduced, via the
  // withCountDongle correlated-subquery helper above.
  const rows = await withCountDongle(baseQuery.selectAll("entities"))
    .orderBy("id")
    .limit(safeLimit)
    .offset(offset)
    .execute();

  return {
    data: await Promise.all((rows as EntityRow[]).map((row) => enrichWithRegionNames(toEntities(row)))),
    pagination: {
      total,
      pages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      perPage: safeLimit,
    },
  };
}
