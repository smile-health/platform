// ---------------------------------------------------------------------------
// Table: partnership
// (mirrors apps/wms-service's infrastructure/database/models/PartnershipModel.ts
// exactly — see db.ts's PartnershipTable, extended in migration 12 with the
// full column set. `paranoid: true` soft-delete convention, same as every
// other module in this domain.)
//
// The original PartnershipRepositoryImpl.ts additionally enriches almost
// every read path with cross-service HTTP lookups (getEntityDetail against
// apps/core, for consumerDetail/providerDetail/providerName/consumerName/
// treatmentCompanyName/landfilCompanyName/recycleCompanyName/nib) and a
// Sequelize `include` join across waste_classification -> waste_hierarchy
// (wasteType/wasteGroup/wasteCharacteristics) for getPartnershipById /
// getAllPartnershipByUserId. Every function below returns the plain
// `partnership` row only — providerName/consumerName are added on top in
// partnership.service.ts (see withProviderConsumerNames), from the local
// `entities` table rather than the HTTP fallback; the hierarchy join and the
// remaining *CompanyName/nib fields aren't ported. (Same local-entities-table
// pattern already used by partnership-operator-map's entityName and
// partner-vehicle's entityName.)
// ---------------------------------------------------------------------------

import { db } from "../../db/db";
import { sql } from "kysely";
import type {
  Partnership,
  PartnershipConsumerType,
  PartnershipProviderType,
  PartnershipStatusValue,
  PartnershipWasteClassification,
} from "./partnership.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
  contract_id: string | null;
  contract_start_date: Date | null;
  contract_end_date: Date | null;
  consumer_id: number;
  consumer_type: PartnershipConsumerType;
  waste_classification_id: number | null;
  provider_id: number | null;
  provider_type: PartnershipProviderType | null;
  partnership_status: PartnershipStatusValue;
  has_incinerator: boolean;
  has_autoclave: boolean;
  pic_name: string | null;
  pic_position: string | null;
  pic_phone_number: string | null;
  price_per_kg: number | null;
  transporter_id: number | null;
}): Partnership {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    contractId: row.contract_id ?? undefined,
    contractStartDate: row.contract_start_date ?? undefined,
    contractEndDate: row.contract_end_date ?? undefined,
    // provider_id is nullable in the stand-in table's original definition
    // (migration 5), but every real row written by createPartnership/update
    // always carries one — 0 here would only surface for a row inserted
    // outside this module's own create() (shouldn't happen in practice).
    consumerId: row.consumer_id,
    consumerType: row.consumer_type,
    wasteClassificationId: row.waste_classification_id ?? undefined,
    providerId: row.provider_id ?? 0,
    providerType: row.provider_type ?? undefined,
    partnershipStatus: row.partnership_status,
    hasIncinerator: row.has_incinerator,
    hasAutoclave: row.has_autoclave,
    picName: row.pic_name ?? undefined,
    picPosition: row.pic_position ?? undefined,
    picPhoneNumber: row.pic_phone_number ?? undefined,
    pricePerKg: row.price_per_kg ?? undefined,
    transporterId: row.transporter_id ?? undefined,
  };
}

export async function findById(id: number): Promise<Partnership | null> {
  const row = await db
    .selectFrom("partnership")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors findPartnershipByCondition()'s specific call shapes inside
// CreatePartnership.ts's duplicate-check branches — a fixed set of
// (consumerId, wasteClassificationId, providerType-in-list) filters, plus
// optional providerId/transporterId equality, rather than a free-form
// Sequelize WhereOptions passthrough (Kysely has no direct equivalent, and
// every real caller only ever needs this exact shape).
export async function findActiveByCondition(params: {
  consumerId: number;
  wasteClassificationId: number;
  providerTypeIn: PartnershipProviderType[];
  providerId?: number;
  transporterId?: number;
}): Promise<Partnership | null> {
  let query = db
    .selectFrom("partnership")
    .selectAll()
    .where("consumer_id", "=", params.consumerId)
    .where("partnership_status", "=", "ACTIVE")
    .where("waste_classification_id", "=", params.wasteClassificationId)
    .where("provider_type", "in", params.providerTypeIn)
    .where("deleted_at", "is", null);
  if (params.providerId !== undefined) {
    query = query.where("provider_id", "=", params.providerId);
  }
  if (params.transporterId !== undefined) {
    query = query.where("transporter_id", "=", params.transporterId);
  }
  const row = await query.executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors WasteClassificationModel.findOne({ attributes: ['id',
// 'hasMultipleTransporters'] }) inside CreatePartnership.ts.
export async function getWasteClassificationHasMultipleTransporters(
  wasteClassificationId: number,
): Promise<boolean> {
  const row = await db
    .selectFrom("waste_classification")
    .select("has_multiple_transporters")
    .where("id", "=", wasteClassificationId)
    .executeTakeFirst();
  return Boolean(row?.has_multiple_transporters);
}

export async function create(payload: {
  createdBy: string;
  consumerId: number;
  consumerType: PartnershipConsumerType;
  wasteClassificationId?: number;
  providerId: number;
  providerType?: PartnershipProviderType;
  partnershipStatus: PartnershipStatusValue;
  hasIncinerator: boolean;
  hasAutoclave: boolean;
  contractId?: string;
  contractStartDate?: Date;
  contractEndDate?: Date;
  picName?: string;
  picPosition?: string;
  picPhoneNumber?: string;
  pricePerKg?: number;
  transporterId?: number | null;
}): Promise<Partnership> {
  const row = await db
    .insertInto("partnership")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      consumer_id: payload.consumerId,
      consumer_type: payload.consumerType,
      waste_classification_id: payload.wasteClassificationId ?? null,
      provider_id: payload.providerId,
      provider_type: payload.providerType ?? null,
      partnership_status: payload.partnershipStatus,
      has_incinerator: payload.hasIncinerator,
      has_autoclave: payload.hasAutoclave,
      contract_id: payload.contractId ?? null,
      contract_start_date: payload.contractStartDate ?? null,
      contract_end_date: payload.contractEndDate ?? null,
      pic_name: payload.picName ?? null,
      pic_position: payload.picPosition ?? null,
      pic_phone_number: payload.picPhoneNumber ?? null,
      price_per_kg: payload.pricePerKg ?? null,
      transporter_id: payload.transporterId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

// Mirrors updatePartnership()'s field set exactly — id/createdBy/created_at
// are never part of the SET clause. The original's contract-date "sync to
// parent partnership" side-effect (allowedProviderTypes + a second
// PartnershipModel.update on a sibling row) is a distinct piece of business
// logic layered on top of a plain field update — see
// partnership.service.ts's updatePartnership, which calls
// syncContractDatesToParent below after this function returns.
export async function update(
  id: number,
  payload: {
    updatedBy: string;
    consumerId: number;
    consumerType: PartnershipConsumerType;
    wasteClassificationId?: number;
    providerId: number;
    providerType: PartnershipProviderType;
    partnershipStatus: PartnershipStatusValue;
    hasIncinerator: boolean;
    hasAutoclave: boolean;
    contractId?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    picName?: string;
    picPosition?: string;
    picPhoneNumber?: string;
    pricePerKg?: number;
  },
): Promise<Partnership | null> {
  const row = await db
    .updateTable("partnership")
    .set({
      updated_by: payload.updatedBy,
      updated_at: new Date(),
      consumer_id: payload.consumerId,
      consumer_type: payload.consumerType,
      waste_classification_id: payload.wasteClassificationId ?? null,
      provider_id: payload.providerId,
      provider_type: payload.providerType,
      partnership_status: payload.partnershipStatus,
      has_incinerator: payload.hasIncinerator,
      has_autoclave: payload.hasAutoclave,
      contract_id: payload.contractId ?? null,
      contract_start_date: payload.contractStartDate ?? null,
      contract_end_date: payload.contractEndDate ?? null,
      pic_name: payload.picName ?? null,
      pic_position: payload.picPosition ?? null,
      pic_phone_number: payload.picPhoneNumber ?? null,
      price_per_kg: payload.pricePerKg ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors deletePartnership()'s guard: refuses to delete (returns false) if
// any partnership_operator_map row still references this partnership.
export async function hasOperatorMapUsage(partnershipId: number): Promise<boolean> {
  const row = await db
    .selectFrom("partnership_operator_map")
    .select("partnership_id")
    .where("partnership_id", "=", partnershipId)
    .executeTakeFirst();
  return Boolean(row);
}

// Mirrors PartnershipRepositoryImpl.updateStatusPartnreship(id, 'EXPIRED') —
// called only from expireContractIfDue in partnership.service.ts (the
// scheduled-event-dispatcher's contract-expiry advance, moved here from the
// dispatcher since this domain owns `partnership`).
export async function updateStatusToExpired(id: number): Promise<PartnershipStatusValue | null> {
  const row = await db
    .updateTable("partnership")
    .set({ partnership_status: "EXPIRED", updated_at: new Date() })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returning("partnership_status")
    .executeTakeFirst();
  return row ? row.partnership_status : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const row = await db
    .updateTable("partnership")
    .set({
      deleted_at: new Date(),
      ...(deletedBy ? { deleted_by: deletedBy } : {}),
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return Boolean(row);
}

// Mirrors getAllPartnershipByUserId()'s entityId/entityTag routing
// (hospital -> filter by consumer_id + transporter_id IS NULL; super-admin ->
// transporter_id IS NULL only; anything else -> filter by transporter_id)
// plus the optional search/providerId/consumerId/wasteClassificationId/
// partnershipStatus filters. The original's `search` OR-matches on
// partnershipStatus/contractId via a SQL LIKE; reproduced with ilike here
// (Postgres-native case-insensitive equivalent, same convention as
// partner-vehicle.repository.ts's search).
export async function findAllPaginated(params: {
  limit: number;
  page: number;
  entityId?: number;
  entityTag?: string;
  search?: string;
  providerId?: number;
  consumerId?: number;
  wasteClassificationId?: number;
  partnershipStatus?: string;
}): Promise<{ data: Partnership[]; pagination: { total: number; pages: number; currentPage: number; perPage: number } }> {
  let query = db.selectFrom("partnership").where("deleted_at", "is", null);

  if (params.entityId && params.entityTag) {
    if (params.entityTag === "hospital") {
      query = query.where("consumer_id", "=", params.entityId).where("transporter_id", "is", null);
    } else if (params.entityTag === "super-admin") {
      query = query.where("transporter_id", "is", null);
    } else {
      query = query.where("transporter_id", "=", params.entityId);
    }
  }

  if (params.search) {
    const search = params.search;
    query = query.where((eb) =>
      eb.or([
        // partnership_status is a real Postgres enum column — cast to text
        // for an ilike match, same rationale as partner-vehicle's vehicle_type.
        sql<boolean>`partnership_status::text ilike ${`%${search}%`}`,
        eb("contract_id", "ilike", `%${search}%`),
      ]),
    );
  }
  if (params.providerId) {
    query = query.where("provider_id", "=", params.providerId);
  }
  if (params.consumerId) {
    query = query.where("consumer_id", "=", params.consumerId);
  }
  if (params.wasteClassificationId) {
    query = query.where("waste_classification_id", "=", params.wasteClassificationId);
  }
  if (params.partnershipStatus) {
    query = query.where("partnership_status", "=", params.partnershipStatus as PartnershipStatusValue);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("updated_at", "desc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map(toEntity),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors getPartnershipByThirdPartyAdmin()'s entityTag routing (tag
// containing 'hospital' -> filter by consumer_id, else -> filter by
// transporter_id) grouped by provider_id. providerName enrichment happens
// in partnership.service.ts's getPartnershipByThirdPartyAdmin, from the
// local `entities` table.
export async function findGroupedByProviderForThirdPartyAdmin(params: {
  entityId?: number;
  entityTag?: string;
}): Promise<Array<{ id: number; providerId: number }>> {
  let query = db.selectFrom("partnership").where("deleted_at", "is", null);

  if (params.entityId && params.entityTag) {
    const tag = params.entityTag.toLowerCase();
    if (tag.includes("hospital")) {
      query = query.where("consumer_id", "=", params.entityId);
    } else {
      query = query.where("transporter_id", "=", params.entityId);
    }
  }

  const rows = await query
    .select(["id", "provider_id"])
    .where("provider_id", "is not", null)
    .groupBy(["provider_id", "id"])
    .execute();

  return rows.map((row) => ({ id: row.id, providerId: row.provider_id as number }));
}

// Mirrors getHasMultiplePartnership()'s raw-SQL join (partnership + entities
// + waste_classification) exactly — grouped by transporter provider, only
// wasteClassificationIds whose classification allows multiple transporters,
// only ACTIVE and not-yet-expired contracts, transporter_id IS NULL (i.e.
// these are the transporter-slot rows themselves, not treatment-provider
// rows attached to a transporter).
export async function findMultipleTransporterPartnerships(params: {
  healthcareFacilityId: number;
  wasteClassificationIds: number[];
}): Promise<Array<{ transporterId: number; transporterName: string | null; contractStartDate: Date | null; contractEndDate: Date | null }>> {
  const rows = await db
    .selectFrom("partnership")
    .innerJoin("waste_classification", "waste_classification.id", "partnership.waste_classification_id")
    .innerJoin("entities", "entities.id", "partnership.provider_id")
    .select((eb) => [
      "entities.id as transporterId",
      "entities.name as transporterName",
      eb.fn.min("partnership.contract_start_date").as("contractStartDate"),
      eb.fn.max("partnership.contract_end_date").as("contractEndDate"),
    ])
    .where("partnership.consumer_id", "=", params.healthcareFacilityId)
    .where("partnership.waste_classification_id", "in", params.wasteClassificationIds)
    .where("waste_classification.has_multiple_transporters", "=", true)
    .where("partnership.transporter_id", "is", null)
    .where("partnership.contract_end_date", ">=", new Date())
    .where("partnership.partnership_status", "=", "ACTIVE")
    .where("partnership.deleted_at", "is", null)
    .groupBy(["entities.id", "entities.name"])
    .execute();

  return rows.map((row) => ({
    transporterId: row.transporterId,
    transporterName: row.transporterName,
    contractStartDate: row.contractStartDate,
    contractEndDate: row.contractEndDate,
  }));
}

// Mirrors findOneThirdParty()'s raw-SQL query exactly — the single "current"
// transporter-slot partnership (ORDER BY contract_end_date DESC, updated_at
// DESC LIMIT 1) for a given (healthcareFacility, transporter,
// wasteClassification[]) combination. The original also filters
// `transporter_id IS NOT NULL`, which is redundant once `transporter_id =
// :transporterId` is applied — dropped here as a no-op simplification.
export async function findOneThirdParty(params: {
  healthcareFacilityId: number;
  transporterId: number;
  wasteClassificationIds: number[];
}): Promise<{ thirdPartyId: number; thirdPartyName: string | null; contractStartDate: Date | null; contractEndDate: Date | null } | null> {
  const row = await db
    .selectFrom("partnership")
    .innerJoin("waste_classification", "waste_classification.id", "partnership.waste_classification_id")
    .innerJoin("entities", "entities.id", "partnership.provider_id")
    .select([
      "entities.id as thirdPartyId",
      "entities.name as thirdPartyName",
      "partnership.contract_start_date as contractStartDate",
      "partnership.contract_end_date as contractEndDate",
    ])
    .where("partnership.consumer_id", "=", params.healthcareFacilityId)
    .where("partnership.transporter_id", "=", params.transporterId)
    .where("partnership.waste_classification_id", "in", params.wasteClassificationIds)
    .where("waste_classification.has_multiple_transporters", "=", true)
    .where("partnership.partnership_status", "=", "ACTIVE")
    .where("partnership.deleted_at", "is", null)
    .orderBy("partnership.contract_end_date", "desc")
    .orderBy("partnership.updated_at", "desc")
    .limit(1)
    .executeTakeFirst();

  return row
    ? {
        thirdPartyId: row.thirdPartyId,
        thirdPartyName: row.thirdPartyName,
        contractStartDate: row.contractStartDate,
        contractEndDate: row.contractEndDate,
      }
    : null;
}

// Mirrors getHealthcareByThirdPartyAdmin()'s "consumers of this
// third-party/transporter" grouped listing. The original enriches
// consumerName via a cross-service getEntityDetail(consumerId, token) call
// against apps/core; simplified here to a plain join against the local
// `entities` table (already joined the same way in
// findMultipleTransporterPartnerships above), since no thirdparty-admin
// client is ported into this module yet.
export async function findConsumersForThirdPartyAdmin(providerId: number): Promise<Array<{ consumerId: number; consumerName: string | null }>> {
  const rows = await db
    .selectFrom("partnership")
    .leftJoin("entities", "entities.id", "partnership.consumer_id")
    .select(["partnership.consumer_id as consumerId", "entities.name as consumerName"])
    .where("partnership.provider_id", "=", providerId)
    .where("partnership.deleted_at", "is", null)
    .groupBy(["partnership.consumer_id", "entities.name"])
    .execute();

  return rows.map((row) => ({ consumerId: row.consumerId, consumerName: row.consumerName }));
}

// getWasteClassificationByHealthcare()'s provider-type filter, mirrored
// verbatim from PartnershipRepositoryImpl.ts's `filterisSameCompany`.
const DEFAULT_TRANSPORTER_PROVIDER_TYPES: PartnershipProviderType[] = [
  "TRANSPORTER",
  "TRANSPORTER_GOVERNMENT_WASTE_BANK",
];
const SAME_COMPANY_PROVIDER_TYPES: PartnershipProviderType[] = [
  "TRANSPORTER_RECYCLER",
  "TRANSPORTER_LANDFILL",
  "TRANSPORTER_TREATMENT_PROVIDER",
  "TRANSPORTER_TREATMENT",
  "SPECIALIZED_TREATMENT_PROVIDER",
  "TRANSPORTER_GOVERNMENT",
];

// Mirrors getWasteClassificationByHealthcare()'s three-table join
// (partnership + waste_classification + waste_hierarchy), filtered by
// consumer/provider and an active waste_hierarchy row. The original's GROUP
// BY only names waste_classification_id (MySQL's lax GROUP BY allows
// selecting other non-aggregated columns anyway); Postgres requires every
// selected non-aggregate column in the GROUP BY, so all of them are listed
// here — functionally equivalent since (partnership.id, waste_classification_id)
// already uniquely determines every other selected column.
export async function findWasteClassificationsByHealthcare(params: {
  consumerId: number;
  providerId: number;
  isSameCompany?: number;
}): Promise<
  Array<{
    id: number;
    wasteClassificationId: number | null;
    providerType: PartnershipProviderType | null;
    wasteCharacteristicName: string | null;
    contractId: string | null;
    contractStartDate: Date | null;
    contractEndDate: Date | null;
    wasteCode: string;
  }>
> {
  const providerTypes =
    params.isSameCompany === 1 ? SAME_COMPANY_PROVIDER_TYPES : DEFAULT_TRANSPORTER_PROVIDER_TYPES;

  const rows = await db
    .selectFrom("partnership")
    .innerJoin("waste_classification", "waste_classification.id", "partnership.waste_classification_id")
    .innerJoin("waste_hierarchy", "waste_hierarchy.id", "waste_classification.waste_characteristics_id")
    .select([
      "partnership.id as id",
      "partnership.waste_classification_id as wasteClassificationId",
      "partnership.provider_type as providerType",
      "waste_hierarchy.name as wasteCharacteristicName",
      "partnership.contract_id as contractId",
      "partnership.contract_start_date as contractStartDate",
      "partnership.contract_end_date as contractEndDate",
      "waste_classification.waste_code as wasteCode",
    ])
    .where("waste_hierarchy.is_active", "=", true)
    .where("partnership.consumer_id", "=", params.consumerId)
    .where("partnership.provider_id", "=", params.providerId)
    .where("partnership.provider_type", "in", providerTypes)
    .where("partnership.deleted_at", "is", null)
    .groupBy([
      "partnership.id",
      "partnership.waste_classification_id",
      "partnership.provider_type",
      "waste_hierarchy.name",
      "partnership.contract_id",
      "partnership.contract_start_date",
      "partnership.contract_end_date",
      "waste_classification.waste_code",
    ])
    .execute();

  return rows;
}

// Mirrors getWasteClassificationByConsumerIdAndProviderId()'s paginated
// three-table join (partnership + waste_classification + waste_hierarchy),
// restricted to transporter-less (parent) partnerships. Same GROUP BY
// widening rationale as findWasteClassificationsByHealthcare above.
export async function findWasteClassificationsByConsumerAndProvider(params: {
  limit: number;
  page: number;
  providerId: number;
  consumerId: number;
}): Promise<{ data: PartnershipWasteClassification[]; pagination: { total: number; pages: number; currentPage: number; perPage: number } }> {
  const baseQuery = db
    .selectFrom("partnership")
    .innerJoin("waste_classification", "waste_classification.id", "partnership.waste_classification_id")
    .innerJoin("waste_hierarchy", "waste_hierarchy.id", "waste_classification.waste_characteristics_id")
    .where("partnership.consumer_id", "=", params.consumerId)
    .where("partnership.provider_id", "=", params.providerId)
    .where("partnership.transporter_id", "is", null)
    .where("partnership.deleted_at", "is", null);

  const countRow = await baseQuery
    .select((eb) => eb.fn.count<string>("partnership.waste_classification_id").distinct().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await baseQuery
    .select([
      "partnership.waste_classification_id as wasteClassificationId",
      "waste_hierarchy.name as wasteCharacteristicsName",
      "waste_hierarchy.name_en as wasteCharacteristicsNameEn",
      "waste_classification.waste_code as wasteCode",
      "partnership.price_per_kg as price",
      "partnership.contract_start_date as contractStartDate",
      "partnership.contract_end_date as contractEndDate",
      "partnership.contract_id as contractId",
      "partnership.partnership_status as partnershipStatus",
      "partnership.provider_type as providerType",
    ])
    .groupBy([
      "partnership.waste_classification_id",
      "waste_hierarchy.name",
      "waste_hierarchy.name_en",
      "waste_classification.waste_code",
      "partnership.price_per_kg",
      "partnership.contract_start_date",
      "partnership.contract_end_date",
      "partnership.contract_id",
      "partnership.partnership_status",
      "partnership.provider_type",
    ])
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  return {
    data: rows.map((row) => ({
      wasteClassificationId: row.wasteClassificationId as number,
      wasteCharacteristicsName: row.wasteCharacteristicsName,
      wasteCharacteristicsNameEn: row.wasteCharacteristicsNameEn,
      wasteCode: row.wasteCode,
      price: row.price,
      contractStartDate: row.contractStartDate,
      contractEndDate: row.contractEndDate,
      contractId: row.contractId,
      partnershipStatus: row.partnershipStatus,
      providerType: row.providerType,
    })),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit),
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}

// Mirrors PartnershipRepositoryImpl.findPartnershipByCondition's two call
// shapes inside getProviderNameAndListOperatorNameByHfIdAndwasteClassificationId:
// an active partnership for (consumerId, wasteClassificationId), optionally
// narrowed to a specific providerId, split by whether transporter_id is set
// (transporter leg vs. treatment leg of the same waste_classification).
export async function findActivePartnershipByTransporterCondition(params: {
  consumerId: number;
  wasteClassificationId: number;
  providerId?: number;
  transporterIdIsNull: boolean;
}): Promise<{ id: number; providerId: number } | null> {
  let query = db
    .selectFrom("partnership")
    .select(["id", "provider_id"])
    .where("consumer_id", "=", params.consumerId)
    .where("waste_classification_id", "=", params.wasteClassificationId)
    .where("partnership_status", "=", "ACTIVE")
    .where("deleted_at", "is", null)
    .where("transporter_id", params.transporterIdIsNull ? "is" : "is not", null);
  if (params.providerId !== undefined) {
    query = query.where("provider_id", "=", params.providerId);
  }
  const row = await query.executeTakeFirst();
  return row && row.provider_id !== null ? { id: row.id, providerId: row.provider_id } : null;
}

// Mirrors the inline `sql`/`sql2` raw queries inside the same original
// method: operator ids mapped to any partnership where this provider serves
// this consumer, split the same way (transporter leg vs. treatment leg).
export async function findOperatorIdsForProviderConsumer(params: {
  providerId: number;
  consumerId: number;
  transporterIdIsNull: boolean;
}): Promise<string[]> {
  const rows = await db
    .selectFrom("partnership_operator_map as pom")
    .innerJoin("partnership as p", "p.id", "pom.partnership_id")
    .select("pom.operator_id")
    .where("p.provider_id", "=", params.providerId)
    .where("p.consumer_id", "=", params.consumerId)
    .where("p.transporter_id", params.transporterIdIsNull ? "is" : "is not", null)
    .where("pom.deleted_at", "is", null)
    .execute();
  return rows.map((row) => row.operator_id);
}

// Mirrors EntityLocationRepositoryImpl.getAllEntityLocationsPartnership's
// InfraRegistry.partnershipRepositoryImpl!.findAllPartnershipByCondition
// call: every ACTIVE partnership where this entity is the TRANSPORTER-role
// provider serving a given healthcare facility (optionally narrowed to a
// specific waste classification) — used by entity-location.service.ts to
// widen its entity_location lookup to that transporter's own locations too.
export async function findTransporterProviderIds(params: {
  transporterId: number;
  healthcareFacilityId?: number;
  wasteClassificationId?: number;
}): Promise<number[]> {
  let query = db
    .selectFrom("partnership")
    .select("provider_id")
    .where("transporter_id", "=", params.transporterId)
    .where("provider_type", "=", "TRANSPORTER")
    .where("partnership_status", "=", "ACTIVE")
    .where("deleted_at", "is", null);
  if (params.healthcareFacilityId !== undefined) {
    query = query.where("consumer_id", "=", params.healthcareFacilityId);
  }
  if (params.wasteClassificationId !== undefined) {
    query = query.where("waste_classification_id", "=", params.wasteClassificationId);
  }
  const rows = await query.execute();
  return rows.map((row) => row.provider_id).filter((id): id is number => id !== null);
}

// Mirrors updatePartnership()'s "sync contract dates to the parent
// (transporter-less) partnership" side effect: when a transporter-role
// partnership's contract dates change, the sibling partnership for the same
// (providerId, wasteClassificationId, consumerId) that has no transporter_id
// (the "parent" — the direct provider-consumer contract this transporter
// leg rides on) gets the same dates applied.
export async function syncContractDatesToParent(params: {
  providerId: number;
  wasteClassificationId?: number;
  consumerId: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
}): Promise<void> {
  await db
    .updateTable("partnership")
    .set({
      contract_start_date: params.contractStartDate ?? null,
      contract_end_date: params.contractEndDate ?? null,
    })
    .where("provider_id", "=", params.providerId)
    .where("waste_classification_id", params.wasteClassificationId !== undefined ? "=" : "is", params.wasteClassificationId ?? null)
    .where("consumer_id", "=", params.consumerId)
    .where("partnership_status", "=", "ACTIVE")
    .where("transporter_id", "is not", null)
    .where("deleted_at", "is", null)
    .execute();
}
