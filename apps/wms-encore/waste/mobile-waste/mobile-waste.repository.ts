// Backs mobile-waste.service.ts's getWasteBagReportByStatus (reportWasteBagByStatusController
// in the original) — the one query in this module with no existing analog in
// ../waste-bag/waste-bag.repository.ts.
//
// Deviation from the original (GetWasteBagByWasteStatus's SQL in
// ReportWasteBagRepositoryImpl.ts): the original joins against
// waste_bag_audit_trail to resolve each bag's "latest status as of the report
// window" (a bag may have moved on since). waste_bag_audit_trail isn't part
// of this migration yet (not modeled in db.ts), so this groups by waste_bag's
// current waste_status directly — same simplification precedent as
// waste-bag.repository.ts's dashboard-style summaries, which also read
// current-state columns rather than reconstructing historical state.
import { db } from "../../db/db";

export interface WasteBagReportByStatusParams {
  limit: number;
  page: number;
  entityId?: number;
  startDate: string;
  endDate: string;
  wasteTypeId?: number;
  wasteGroupId?: number;
  wasteStatus?: string;
}

export interface WasteBagReportByStatusRow {
  wasteStatus: string;
  totalWasteBag: number;
  totalWeightInKgs: number;
}

export async function findWasteBagReportByStatus(
  params: WasteBagReportByStatusParams
): Promise<{
  data: WasteBagReportByStatusRow[];
  pagination: { total: number; pages: number; currentPage: number; perPage: number };
}> {
  let query = db
    .selectFrom("waste_bag")
    .where("deleted_at", "is", null)
    .where("created_at", ">=", new Date(`${params.startDate} 00:00:00`))
    .where("created_at", "<=", new Date(`${params.endDate} 23:59:59`));

  if (params.entityId) query = query.where("healthcare_facility_id", "=", params.entityId);
  if (params.wasteStatus) query = query.where("waste_status", "=", params.wasteStatus);
  // wasteTypeId/wasteGroupId in the original filter against waste_classification's
  // waste_type_id and waste_bag.waste_group_ids (a serialized list) respectively —
  // neither is wired here; deferred, same pragmatism as the rest of this module.

  const grouped = await query
    .select([
      "waste_status as wasteStatus",
      (eb) => eb.fn.countAll<string>().as("totalWasteBag"),
      (eb) => eb.fn.sum<string>("weight_in_kgs").as("totalWeightInKgs"),
    ])
    .groupBy("waste_status")
    .orderBy("waste_status")
    .execute();

  const total = grouped.length;
  const offset = (params.page - 1) * params.limit;
  const page = grouped.slice(offset, offset + params.limit);

  return {
    data: page.map((row) => ({
      wasteStatus: row.wasteStatus as string,
      totalWasteBag: Number(row.totalWasteBag),
      totalWeightInKgs: Number(row.totalWeightInKgs ?? 0),
    })),
    pagination: {
      total,
      pages: Math.ceil(total / params.limit) || 1,
      currentPage: params.page,
      perPage: params.limit,
    },
  };
}
