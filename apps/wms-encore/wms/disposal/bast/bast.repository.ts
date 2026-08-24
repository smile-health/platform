// Postgres columns for tables `disposal` / `disposal_items` (mirrors
// infrastructure/database/models/DisposalModel.ts / DisposalItemsModel.ts
// field-for-field, Sequelize `paranoid: true` soft-delete -> deleted_at/
// deleted_by here). See db/migrations/15_create_disposal_tables.up.sql for
// the CREATE TABLE.

import { sql } from "kysely";
import { db } from "../db";
import type {
  Disposal,
  DisposalItemRow,
  PaginationMeta,
  WasteBagStatusHistory,
} from "./bast.types";

// Mirrors shared/utils/logHistories.ts's WASTE_STATUS / WASTE_STATUS_ID
// enums, used only for waste_info.waste_bag_histories label lookup in
// getDisposal below.
const WASTE_STATUS: Record<string, string> = {
  INTERNAL_LANDFILLED: "Internally Landfilled",
  IN_TEMPORARY_STORAGE: "In Temporary Storage",
  INCINERATED: "Incinerated",
  STERILISED: "Sterilized",
  IN_TRANSIT: "In Transit",
  READY_FOR_TREATMENT: "Ready for Treatment",
  RECYCLED: "Recycled",
  LANDFILLED: "Landfilled",
  COLLECTED: "Collected",
  DISPOSED: "Disposed",
};
const WASTE_STATUS_ID: Record<string, string> = {
  INTERNAL_LANDFILLED: "Penimbun Internal",
  IN_TEMPORARY_STORAGE: "Tersimpan",
  INCINERATED: "Diolah Insinerator Internal",
  STERILISED: "Diolah Autoklaf Internal",
  IN_TRANSIT: "Diangkut",
  READY_FOR_TREATMENT: "Diterima Pengolah",
  RECYCLED: "Didaur Ulang",
  LANDFILLED: "Ditimbun",
  COLLECTED: "Pengangkut Khusus",
  DISPOSED: "Pembuangan Sampah",
};

function toEntity(row: {
  id: number;
  bast_no: string;
  description: string | null;
  created_by: string;
  created_name: string | null;
  entity_id: number;
  entity_name: string | null;
  status: string;
  is_read: boolean;
  approved_by: string | null;
  rejected_by: string | null;
  rejected_reason: string | null;
  approved_at: Date | null;
  rejected_at: Date | null;
  created_at: Date;
}): Disposal {
  return {
    id: row.id,
    bastNo: row.bast_no,
    description: row.description ?? undefined,
    createdBy: row.created_by,
    createdName: row.created_name ?? undefined,
    entityId: row.entity_id,
    entityName: row.entity_name ?? undefined,
    status: row.status as Disposal["status"],
    isRead: row.is_read,
    approvedBy: row.approved_by ?? undefined,
    rejectedBy: row.rejected_by ?? undefined,
    rejectedReason: row.rejected_reason ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    rejectedAt: row.rejected_at ?? undefined,
    createdAt: row.created_at,
  };
}

// Mirrors DisposalRepositoryImpl.createDisposal. instruction_type_id/label
// (accepted by the request but never persisted in the original either) are
// intentionally not columns on `disposal`.
export async function createDisposal(payload: {
  bastNo: string;
  description?: string;
  createdBy: string;
  createdName?: string;
  entityId: number;
  entityName?: string;
  items: Array<{ materialId: number; materialName: string; qty: number }>;
}): Promise<{ bast_no: string } | null> {
  const created = await db
    .insertInto("disposal")
    .values({
      bast_no: payload.bastNo,
      description: payload.description ?? null,
      created_by: payload.createdBy,
      created_name: payload.createdName ?? null,
      entity_id: payload.entityId,
      entity_name: payload.entityName ?? null,
      status: "PENDING",
      is_read: false,
    })
    .returning(["id", "bast_no"])
    .executeTakeFirst();

  if (!created?.bast_no) return null;

  if (payload.items.length > 0) {
    await db
      .insertInto("disposal_items")
      .values(
        payload.items.map((item) => ({
          material_id: item.materialId,
          bast_no: created.bast_no,
          material_name: item.materialName,
          qty: item.qty,
        }))
      )
      .execute();
  }

  return { bast_no: created.bast_no };
}

// Mirrors DisposalRepositoryImpl.approvalDisposal. Only PENDING rows
// transition; rejectedDisposalBast (thirdPartyClient's cross-service call to
// notify apps/wms-service's own BE of the rejection) isn't ported — see
// bast.service.ts's TODO.
export async function approvalDisposal(
  bastNo: string,
  status: "APPROVED" | "REJECTED",
  userUuid: string,
  reason?: string
): Promise<boolean> {
  if (status === "APPROVED") {
    await db
      .updateTable("disposal")
      .set({ approved_by: userUuid, approved_at: new Date(), status: "APPROVED" })
      .where("bast_no", "=", bastNo)
      .where("status", "=", "PENDING")
      .execute();
  } else {
    await db
      .updateTable("disposal")
      .set({
        rejected_by: userUuid,
        rejected_reason: reason ?? null,
        rejected_at: new Date(),
        status: "REJECTED",
      })
      .where("bast_no", "=", bastNo)
      .where("status", "=", "PENDING")
      .execute();
  }
  return true;
}

async function findItemsByBastNo(bastNo: string): Promise<DisposalItemRow[]> {
  const rows = await db
    .selectFrom("disposal_items")
    .select(["id", "material_id", "bast_no", "material_name", "qty"])
    .where("bast_no", "=", bastNo)
    .where("deleted_at", "is", null)
    .execute();
  return rows.map((r) => ({
    id: r.id,
    materialId: r.material_id,
    bastNo: r.bast_no,
    materialName: r.material_name,
    qty: Number(r.qty ?? 0),
  }));
}

// Mirrors DisposalRepositoryImpl.getAlldisposalByEntityId. ILIKE (not LIKE)
// for the search filter — Postgres correctness, same intent as the original
// MySQL Op.like.
export async function findPaginated(params: {
  limit: number;
  page: number;
  entityId?: number;
  search?: string;
  status?: string;
  isRead?: boolean;
}): Promise<{
  data: Array<Disposal & { disposalItems: DisposalItemRow[] }>;
  pagination: PaginationMeta;
}> {
  let query = db.selectFrom("disposal").where("deleted_at", "is", null);

  if (params.search) {
    const term = `%${params.search}%`;
    query = query.where((eb) => eb.or([eb("bast_no", "ilike", term), eb("entity_name", "ilike", term)]));
  }
  if (params.entityId) {
    query = query.where("entity_id", "=", params.entityId);
  }
  if (params.status) {
    query = query.where("status", "=", params.status);
  }
  if (params.isRead !== undefined) {
    query = query.where("is_read", "=", params.isRead);
  }

  const countRow = await query.select((eb) => eb.fn.countAll<string>().as("count")).executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("created_at", "asc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  const data = await Promise.all(
    rows.map(async (row) => {
      const entity = toEntity(row);
      const disposalItems = await findItemsByBastNo(entity.bastNo);
      return { ...entity, disposalItems };
    })
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

export async function findByBastNo(bastNo: string): Promise<Disposal | null> {
  const row = await db
    .selectFrom("disposal")
    .selectAll()
    .where("bast_no", "=", bastNo)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

// Mirrors the per-item wasteBag lookup inside DisposalRepositoryImpl.getDisposal:
// FIND_IN_SET(di.material_id, wb.material_ids) > 0 AND wb.bast_no = :bastNo,
// re-expressed for Postgres via string_to_array (material_ids is a
// comma-separated TEXT column, see db.ts's WasteBagTable comment) instead of
// MySQL's FIND_IN_SET. The `disposal_items` join in the original is a no-op
// here (already filtering on material_id/bastNo directly), so it's dropped.
export async function findWasteBagForMaterial(
  bastNo: string,
  materialId: number
): Promise<{
  id: number;
  waste_bag_qr_code_id: string;
  weight_in_kgs: number | null;
  wasteTypeName: string;
  wasteGroupName: string;
  wasteCharacteristicName: string;
} | null> {
  const row = await db
    .selectFrom("waste_bag as wb")
    .innerJoin("waste_classification as wc", "wc.id", "wb.waste_classification_id")
    .innerJoin("waste_hierarchy as wt", "wt.id", "wc.waste_type_id")
    .innerJoin("waste_hierarchy as wg", "wg.id", "wc.waste_group_id")
    .innerJoin("waste_hierarchy as wch", "wch.id", "wc.waste_characteristics_id")
    .select([
      "wb.id as id",
      "wb.waste_bag_qr_code_id as waste_bag_qr_code_id",
      "wb.weight_in_kgs as weight_in_kgs",
      "wt.name as wasteTypeName",
      "wg.name as wasteGroupName",
      "wch.name as wasteCharacteristicName",
    ])
    .where("wb.bast_no", "=", bastNo)
    .where(sql<boolean>`${materialId}::text = ANY(string_to_array(wb.material_ids, ','))`)
    .executeTakeFirst();
  return row ?? null;
}

// Mirrors the getWasteBagLogHistory port used elsewhere in this repo (e.g.
// waste/waste-treatment-external-group/waste-treatment-external-group.repository.ts)
// rather than the fuller shared/utils/logHistories.ts's getLogHistories (which
// also enriches with totalWeight/groupId/disposalMethod via
// waste_treatment_group/waste_transportation_external_group — not needed for
// the fields DisposalDetailItem.waste_info actually surfaces).
export async function getWasteBagStatusHistory(wasteBagQrCodeId?: string): Promise<WasteBagStatusHistory[]> {
  if (!wasteBagQrCodeId) return [];
  const rows = await db
    .selectFrom("waste_bag_audit_trail")
    .select(["waste_bag_status", "created_at"])
    .where("waste_bag_qr_code", "=", wasteBagQrCodeId)
    .where("is_group", "=", true)
    .orderBy("created_at", "asc")
    .execute();

  return rows.map((r) => {
    const raw = r.waste_bag_status ?? "UNKNOWN";
    return {
      status: raw,
      status_label_en: WASTE_STATUS[raw] ?? raw,
      status_label_id: WASTE_STATUS_ID[raw] ?? raw,
      updated_at: r.created_at,
    };
  });
}

export { findItemsByBastNo };
