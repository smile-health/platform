// ---------------------------------------------------------------------------
// Table: partnership_operator_map
// (mirrors apps/wms-service's infrastructure/database/models/
// PartnershipOperatorMapModel.ts exactly — composite primary key,
// `timestamps: true` but createdAt/updatedAt both disabled, `paranoid: true`
// soft-delete):
//
//   partnership_id  bigint unsigned  not null  (PK, part 1; FK -> partnership.id)
//   operator_id     varchar(36)      not null  (PK, part 2)
//   deleted_at      timestamp        null   (paranoid soft-delete)
//   deleted_by      bigint           null
//
// Indexes: PRIMARY (partnership_id, operator_id), btree "partnership_id",
// btree "operator_id" (see model's `indexes`).
//
// This module's queries also read from two sibling not-yet-ported tables,
// for integration reference:
//
//   partnership table (infrastructure/database/models/PartnershipModel.ts,
//   tableName 'partnership'): id, provider_id (bigint unsigned),
//   consumer_id (bigint unsigned), transporter_id (bigint unsigned, nullable)
//   — only these four are read here.
//
// The original repository (PartnershipOperatorMapRepoitoryImpl.ts — note the
// typo in that filename, preserved as-is in apps/wms-service) also enriches
// every row via infrastructure/external-apis/thirdPartyClient's
// getUsersDetail(operatorId, token) / getEntityDetail(consumerId, token).
// Despite living in a file named "external-apis" and being routed through a
// Redis cache + HTTP-fallback-to-apps/core, both helpers' primary path is a
// plain Sequelize query against THIS SAME database's `users` (+ its
// `entities` belongsTo) and `entities` tables respectively — the HTTP call
// only fires when the row isn't found locally. Since `users` and `entities`
// already exist as tables in this port's shared Postgres DB (see
// ../../db/db.ts), the enrichment is ported here as a direct local join via
// findOperatorDetail/../../entity/entities/entities.repository's getEntityId,
// same pattern as healthcare-facility-asset.repository.ts's entityName
// deviation note. The HTTP-fallback path (a user/entity known only to
// apps/core, not yet synced into this DB) is not reproduced, and
// `entityType` (dataUsers?.entity_type?.name in the original) is left
// undefined: it comes from an `entity_type` master table that isn't part of
// this port's schema at all (entities.entity_type_id has no corresponding
// table here), so it isn't derivable locally the way entityName/userName are.
// ---------------------------------------------------------------------------

import { db } from "../../db/db";
import { getEntityId } from "../../entity/entities/entities.repository";
import type { PaginatedPartnershipOperatorMaps, PartnershipOperatorMap } from "./partnership-operator-map.types";

interface OperatorDetail {
  userName?: string;
  firstName?: string;
  lastName?: string;
  entityName?: string;
  email?: string;
  mobilePhone?: string;
  userRole?: string;
}

// Mirrors thirdPartyClient's getUsersDetail lookup logic exactly: match by
// numeric `users.id` when operatorId parses as a number, otherwise by
// `users.user_uuid` (operatorId is a varchar(36), i.e. normally a UUID).
// userRole mirrors the original's `Array.isArray(external_roles) ?
// external_roles[0] : external_roles` — this port's `external_roles` column
// is plain text (comma-less single role per the model comment in
// users.repository.ts), so it's returned as-is.
async function findOperatorDetail(operatorId: string): Promise<OperatorDetail | undefined> {
  const isNumeric = operatorId !== "" && !isNaN(Number(operatorId));
  let query = db
    .selectFrom("users")
    .leftJoin("entities", "entities.id", "users.entity_id")
    .select([
      "users.username as username",
      "users.firstname as firstname",
      "users.lastname as lastname",
      "users.email as email",
      "users.mobile_phone as mobile_phone",
      "users.external_roles as external_roles",
      "entities.name as entity_name",
    ]);
  query = isNumeric
    ? query.where("users.id", "=", Number(operatorId))
    : query.where("users.user_uuid", "=", operatorId);

  const row = await query.executeTakeFirst();
  if (!row) return undefined;

  return {
    userName: row.username ?? undefined,
    firstName: row.firstname ?? undefined,
    lastName: row.lastname ?? undefined,
    entityName: row.entity_name ?? undefined,
    email: row.email ?? undefined,
    mobilePhone: row.mobile_phone ?? undefined,
    userRole: row.external_roles ?? undefined,
  };
}

function operatorFullName(detail: OperatorDetail | undefined): string | undefined {
  if (!detail) return undefined;
  const fullName = [detail.firstName, detail.lastName].filter(Boolean).join(" ");
  return fullName || undefined;
}

export async function findOperatorFullName(operatorId: string): Promise<string | undefined> {
  return operatorFullName(await findOperatorDetail(operatorId));
}

function toEntity(row: { partnership_id: number; operator_id: string }): PartnershipOperatorMap {
  return {
    partnershipId: row.partnership_id,
    operatorId: row.operator_id,
  };
}

export async function findByCondition(
  partnershipId: number,
  operatorId: string,
): Promise<PartnershipOperatorMap | null> {
  const row = await db
    .selectFrom("partnership_operator_map")
    .select(["partnership_id", "operator_id"])
    .where("partnership_id", "=", partnershipId)
    .where("operator_id", "=", operatorId)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function existsPartnership(partnershipId: number): Promise<boolean> {
  const row = await db
    .selectFrom("partnership")
    .select("id")
    .where("id", "=", partnershipId)
    .executeTakeFirst();
  return Boolean(row);
}

export async function create(partnershipId: number, operatorId: string): Promise<void> {
  await db
    .insertInto("partnership_operator_map")
    .values({ partnership_id: partnershipId, operator_id: operatorId })
    .execute();
}

// Mirrors getAllPartnershipOperatorMaps()'s raw-SQL subquery filter exactly:
// only rows whose partnership_id belongs to a partnership where
// provider_id = providerId, consumer_id = healthcareFacilityId (the
// `search` param, coerced to a number), and transporter_id IS NULL.
export async function findAllPaginated(params: {
  limit: number;
  page: number;
  providerId: number;
  healthcareFacilityId: number;
}): Promise<PaginatedPartnershipOperatorMaps> {
  const matchingPartnershipIds = db
    .selectFrom("partnership")
    .select("id")
    .where("provider_id", "=", params.providerId)
    .where("consumer_id", "=", params.healthcareFacilityId)
    .where("transporter_id", "is", null);

  const baseQuery = db
    .selectFrom("partnership_operator_map")
    .where("partnership_id", "in", matchingPartnershipIds);

  const countRow = await baseQuery
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await baseQuery
    .select(["operator_id", "partnership_id"])
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  // Mirrors the original's per-row getUsersDetail(operator_id, token)
  // enrichment (userName/firstName/lastName/entityName/email/mobilePhone/
  // userRole) — see the module header comment for why this is a local join
  // rather than an HTTP call.
  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const detail = await findOperatorDetail(row.operator_id);
      entity.userName = detail?.userName;
      entity.firstName = detail?.firstName;
      entity.lastName = detail?.lastName;
      entity.entityName = detail?.entityName;
      entity.email = detail?.email;
      entity.mobilePhone = detail?.mobilePhone;
      entity.userRole = detail?.userRole;
      return entity;
    }),
  );

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors getAllPartnershipOperatorMapsByThirdpartyAdmin()'s required inner
// join to `partnership` (filtered by provider_id = search, when `search` is
// supplied) plus the optional operator_id equality filter.
export async function findAllByThirdpartyAdmin(params: {
  limit: number;
  page: number;
  search?: string;
  operatorId?: string;
}): Promise<PaginatedPartnershipOperatorMaps> {
  let query = db
    .selectFrom("partnership_operator_map")
    .innerJoin("partnership", "partnership.id", "partnership_operator_map.partnership_id")
    .where("partnership_operator_map.deleted_at", "is", null);

  if (params.search) {
    query = query.where("partnership.provider_id", "=", Number(params.search));
  }
  if (params.operatorId) {
    query = query.where("partnership_operator_map.operator_id", "=", params.operatorId);
  }

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .select([
      "partnership_operator_map.partnership_id",
      "partnership_operator_map.operator_id",
      "partnership.consumer_id",
    ])
    .orderBy("partnership_operator_map.partnership_id", "asc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  // Mirrors the original's per-row getEntityDetail(consumerId, token) ->
  // consumerName and getUsersDetail(operator_id, token) -> operatorName
  // (firstname + lastname, space-joined) enrichment.
  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const [consumerEntity, detail] = await Promise.all([
        getEntityId(row.consumer_id),
        findOperatorDetail(row.operator_id),
      ]);
      entity.consumerName = consumerEntity?.name ?? "-";
      entity.operatorName = operatorFullName(detail);
      return entity;
    }),
  );

  return {
    data,
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors updatePartnershipOperatorMap()'s composite-key "rename": the
// existing row (oldPartnershipId, oldOperatorId) has its own composite key
// overwritten in place with the new (partnershipId, operatorId) values.
export async function update(
  oldPartnershipId: number,
  oldOperatorId: string,
  partnershipId: number,
  operatorId: string,
): Promise<PartnershipOperatorMap | null> {
  const row = await db
    .updateTable("partnership_operator_map")
    .set({ partnership_id: partnershipId, operator_id: operatorId })
    .where("partnership_id", "=", oldPartnershipId)
    .where("operator_id", "=", oldOperatorId)
    .returning(["partnership_id", "operator_id"])
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(
  partnershipId: number,
  operatorId: string,
  deletedBy?: number,
): Promise<boolean> {
  const row = await db
    .updateTable("partnership_operator_map")
    .set({
      deleted_at: new Date(),
      ...(deletedBy ? { deleted_by: deletedBy } : {}),
    })
    .where("partnership_id", "=", partnershipId)
    .where("operator_id", "=", operatorId)
    .where("deleted_at", "is", null)
    .returning(["partnership_id", "operator_id"])
    .executeTakeFirst();
  return Boolean(row);
}

// Mirrors getOperatorsFromOperatorMap()'s join + GROUP BY operator_id: the
// distinct set of operator_ids mapped to any partnership whose provider_id
// matches the caller's entityId.
export async function findDistinctOperatorIdsByProviderEntity(entityId: number): Promise<string[]> {
  const rows = await db
    .selectFrom("partnership_operator_map")
    .innerJoin("partnership", "partnership.id", "partnership_operator_map.partnership_id")
    .select("partnership_operator_map.operator_id")
    .where("partnership.provider_id", "=", entityId)
    .groupBy("partnership_operator_map.operator_id")
    .orderBy("partnership_operator_map.operator_id", "asc")
    .execute();
  return rows.map((row) => row.operator_id);
}
