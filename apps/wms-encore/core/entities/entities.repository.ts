import { db } from "../db-wms";
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
}

function toEntities(row: EntityRow): Entities {
  return {
    id: row.id,
    name: row.name ?? undefined,
    type: row.type ?? undefined,
    address: row.address ?? undefined,
    tag: row.tag ?? undefined,
    provinceId: row.province_id ?? undefined,
    regencyId: row.regency_id ?? undefined,
    subDistrictId: row.sub_district_id ?? undefined,
    villageId: row.village_id ?? undefined,
    integrationType: row.integration_type ?? undefined,
    integrationClientId: row.integration_client_id ?? undefined,
    location: row.location ?? undefined,
    externalProperties: (row.external_properties as Record<string, unknown> | null) ?? undefined,
    entityTypeId: row.entity_type_id ?? undefined,
    code: row.code ?? undefined,
    nib: row.nib ?? undefined,
    headName: row.head_name ?? undefined,
    email: row.email ?? undefined,
    gender: row.gender ?? undefined,
    mobilePhone: row.mobile_phone ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    idSatuSehat: row.id_satu_sehat ?? undefined,
    totalBadRoom: row.total_bad_room ?? undefined,
    percentageBadRoom: row.percentage_bad_room ?? undefined,
    isActive: row.is_active,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function getEntityId(entityId: number): Promise<Entities | null> {
  const row = await db
    .selectFrom("entities")
    .selectAll()
    .where("id", "=", entityId)
    .executeTakeFirst();
  return row ? toEntities(row as EntityRow) : null;
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

  let baseQuery = db.selectFrom("entities");
  let countQuery = db.selectFrom("entities");

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
  // Sequelize `group`/`attributes` clause, plus a COUNT(healthcareAssets.asset_id)
  // aggregate joined from the asset domain (HealthcareAssetModel) for
  // `count_dongle`. The asset domain hasn't been ported to wms-encore yet
  // (see migration plan folder structure — asset/ is a separate, not-yet-built
  // service), so that join is not reproducible here. This port preserves the
  // filter/pagination behavior exactly but returns `countDongle: undefined`
  // rather than fabricating a join against a table that doesn't exist yet;
  // arbitrary groupBy/attributes passthrough is also not reproduced since
  // Kysely requires known columns, not free-form strings from a query param
  // (the original's dynamic group/attributes was effectively an unvalidated
  // passthrough into Sequelize's query builder).
  const rows = await baseQuery
    .selectAll()
    .orderBy("id")
    .limit(safeLimit)
    .offset(offset)
    .execute();

  return {
    data: (rows as EntityRow[]).map(toEntities),
    pagination: {
      total,
      pages: Math.ceil(total / safeLimit),
      currentPage: safePage,
      perPage: safeLimit,
    },
  };
}
