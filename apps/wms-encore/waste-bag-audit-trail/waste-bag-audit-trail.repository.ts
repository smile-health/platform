import { db } from "./db";
import type { PaginationMeta, WasteBagAuditTrailEntry } from "./waste-bag-audit-trail.types";

export async function insertAuditTrailEntry(input: {
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
  // The 11 fields below are optional and unused by every current caller
  // (see waste-bag-audit-trail.service.ts's recordTransition) — the pubsub
  // payloads this module subscribes to don't carry event/source/remarks/
  // healthcareFacilityId/etc. They're accepted here so the columns migration
  // 16 added aren't a dead end once an upstream publisher starts sending
  // this data; left unset, they insert as null/false per that migration's
  // column defaults.
  event?: string;
  source?: string;
  remarks?: string;
  wasteBagStatus?: string;
  isGroup?: boolean;
  isFailed?: boolean;
  transportStatus?: string;
  healthcareFacilityId?: number;
  transporterId?: number;
  thirdPartyProviderId?: number;
  updatedBy?: string;
}): Promise<void> {
  await db
    .insertInto("waste_bag_audit_trail")
    .values({
      waste_bag_id: input.wasteBagId,
      previous_status: input.previousStatus,
      new_status: input.newStatus,
      created_at: new Date(),
      event: input.event ?? null,
      source: input.source ?? null,
      remarks: input.remarks ?? null,
      waste_bag_status: input.wasteBagStatus ?? null,
      is_group: input.isGroup ?? false,
      is_failed: input.isFailed ?? false,
      transport_status: input.transportStatus ?? null,
      healthcare_facility_id: input.healthcareFacilityId ?? null,
      transporter_id: input.transporterId ?? null,
      third_party_provider_id: input.thirdPartyProviderId ?? null,
      updated_by: input.updatedBy ?? null,
    })
    .execute();
}

function toEntity(row: {
  id: number;
  waste_bag_id: number;
  previous_status: string;
  new_status: string;
  created_at: Date;
  event: string | null;
  source: string | null;
  remarks: string | null;
  waste_bag_status: string | null;
  is_group: boolean;
  is_failed: boolean;
  transport_status: string | null;
  healthcare_facility_id: number | null;
  transporter_id: number | null;
  third_party_provider_id: number | null;
  updated_by: string | null;
}): WasteBagAuditTrailEntry {
  return {
    id: row.id,
    wasteBagId: row.waste_bag_id,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    createdAt: row.created_at,
    event: row.event,
    source: row.source,
    remarks: row.remarks,
    wasteBagStatus: row.waste_bag_status,
    isGroup: row.is_group,
    isFailed: row.is_failed,
    transportStatus: row.transport_status,
    healthcareFacilityId: row.healthcare_facility_id,
    transporterId: row.transporter_id,
    thirdPartyProviderId: row.third_party_provider_id,
    updatedBy: row.updated_by,
  };
}

// Mirrors WasteBagAuditTrailRepositoryImpl.getAllWasteBagAuditTrails. `search`
// is dropped (see GetAllWasteBagAuditTrailsRequest's comment — it was a dead
// parameter upstream too); healthcareFacilityId/transporterId/
// thirdPartyProviderId are restored now that migration 16 added their
// backing columns.
export async function findPaginated(params: {
  limit: number;
  page: number;
  wasteBagId?: number;
  healthcareFacilityId?: number;
  transporterId?: number;
  thirdPartyProviderId?: number;
}): Promise<{ data: WasteBagAuditTrailEntry[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_bag_audit_trail");

  if (params.wasteBagId !== undefined) {
    query = query.where("waste_bag_id", "=", params.wasteBagId);
  }
  if (params.healthcareFacilityId !== undefined) {
    query = query.where("healthcare_facility_id", "=", params.healthcareFacilityId);
  }
  if (params.transporterId !== undefined) {
    query = query.where("transporter_id", "=", params.transporterId);
  }
  if (params.thirdPartyProviderId !== undefined) {
    query = query.where("third_party_provider_id", "=", params.thirdPartyProviderId);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("created_at", "asc")
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
