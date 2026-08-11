import { db } from "../db/db";
import type { PaginationMeta, WasteBagAuditTrailEntry } from "./waste-bag-audit-trail.types";

export async function insertAuditTrailEntry(input: {
  wasteBagId: number;
  previousStatus: string;
  newStatus: string;
}): Promise<void> {
  await db
    .insertInto("waste_bag_audit_trail")
    .values({
      waste_bag_id: input.wasteBagId,
      previous_status: input.previousStatus,
      new_status: input.newStatus,
      created_at: new Date(),
    })
    .execute();
}

function toEntity(row: {
  id: number;
  waste_bag_id: number;
  previous_status: string;
  new_status: string;
  created_at: Date;
}): WasteBagAuditTrailEntry {
  return {
    id: row.id,
    wasteBagId: row.waste_bag_id,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    createdAt: row.created_at,
  };
}

// Mirrors WasteBagAuditTrailRepositoryImpl.getAllWasteBagAuditTrails, minus
// the filters that no longer have a matching column on this table (see the
// comment on GetAllWasteBagAuditTrailsRequest) — only wasteBagId + pagination
// remain.
export async function findPaginated(params: {
  limit: number;
  page: number;
  wasteBagId?: number;
}): Promise<{ data: WasteBagAuditTrailEntry[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("waste_bag_audit_trail");

  if (params.wasteBagId !== undefined) {
    query = query.where("waste_bag_id", "=", params.wasteBagId);
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
