// Ported from apps/core/src/modules/material/material.repository.ts.
// Covers: CRUD, code/hierarchy_code lookups, program (workspace) association,
// parent/child relation management, cascading status update, and the
// in-transaction / in-stock-opname guards used by validation. NOT ported:
// integration_client_id scoping (no integration_associations table here yet).
import { db } from "../db";
import type { MaterialsTable } from "../../../core/db.types";
import type { Selectable, Insertable, Updateable } from "kysely";
import { syncJunction } from "../../../shared/db/junction";

export type MaterialRow = Selectable<MaterialsTable>;

export interface MaterialListFilters {
  limit: number;
  page: number;
  search?: string;
  materialLevelIds?: number[];
  materialTypeIds?: number[];
  status?: number;
}

export async function findAll(filters: MaterialListFilters): Promise<{ data: MaterialRow[]; total: number }> {
  let query = db.selectFrom("materials").where("deleted_at", "is", null);
  if (filters.search) {
    query = query.where((eb) => eb.or([eb("name", "like", `%${filters.search}%`), eb("code", "like", `%${filters.search}%`)]));
  }
  if (filters.materialLevelIds?.length) {
    query = query.where("material_level_id", "in", filters.materialLevelIds);
  }
  if (filters.materialTypeIds?.length) {
    query = query.where("material_type_id", "in", filters.materialTypeIds);
  }
  if (filters.status !== undefined) {
    query = query.where("status", "=", filters.status);
  }

  const [data, countRow] = await Promise.all([
    query
      .selectAll()
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit)
      .execute(),
    query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow(),
  ]);

  return { data: data as MaterialRow[], total: Number(countRow.total) };
}

export async function findById(id: number): Promise<MaterialRow | undefined> {
  return db
    .selectFrom("materials")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<MaterialRow | undefined>;
}

export async function findByCode(code: string, excludeId?: number): Promise<MaterialRow | undefined> {
  let query = db.selectFrom("materials").selectAll().where("code", "=", code);
  if (excludeId) query = query.where("id", "!=", excludeId);
  return query.executeTakeFirst() as Promise<MaterialRow | undefined>;
}

export async function findByHierarchyCode(hierarchyCode: string, excludeId?: number): Promise<MaterialRow | undefined> {
  let query = db.selectFrom("materials").selectAll().where("hierarchy_code", "=", hierarchyCode);
  if (excludeId) query = query.where("id", "!=", excludeId);
  return query.executeTakeFirst() as Promise<MaterialRow | undefined>;
}

export async function findByIds(ids: number[]): Promise<MaterialRow[]> {
  if (!ids.length) return [];
  return db.selectFrom("materials").selectAll().where("id", "in", ids).execute() as Promise<MaterialRow[]>;
}

export async function create(
  data: Omit<Insertable<MaterialsTable>, "created_by" | "updated_by">,
  createdBy: number,
): Promise<number> {
  const result = await db
    .insertInto("materials")
    .values({ ...data, created_by: createdBy, updated_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(id: number, data: Updateable<MaterialsTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("materials")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", id)
    .execute();
}

export async function updateStatus(ids: number[], status: number): Promise<void> {
  if (!ids.length) return;
  await db.updateTable("materials").set({ status }).where("id", "in", ids).execute();
}

export async function softDelete(id: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("materials")
    .set({ deleted_at: new Date(), deleted_by: deletedBy })
    .where("id", "=", id)
    .execute();
}

// --- Program (workspace) associations --------------------------------------

export async function setPrograms(materialId: number, programIds: number[]): Promise<void> {
  return syncJunction(materialId, programIds, {
    deleteAllForOwner: async (id) => {
      await db.deleteFrom("material_workspaces").where("material_id", "=", id).execute();
    },
    insertMany: async (id, relatedIds) => {
      await db
        .insertInto("material_workspaces")
        .values(relatedIds.map((workspaceId) => ({ material_id: id, workspace_id: workspaceId })))
        .execute();
    },
  });
}

export async function getProgramsByMaterialIds(materialIds: number[]): Promise<Record<number, number[]>> {
  if (!materialIds.length) return {};
  const rows = await db
    .selectFrom("material_workspaces")
    .select(["material_id", "workspace_id"])
    .where("material_id", "in", materialIds)
    .where("deleted_at", "is", null)
    .execute();
  const grouped: Record<number, number[]> = {};
  for (const row of rows) {
    (grouped[row.material_id] ??= []).push(row.workspace_id);
  }
  return grouped;
}

// --- Hierarchy (parent/child) relations -------------------------------------

export async function setParentRelations(materialId: number, parentIds: number[]): Promise<void> {
  return syncJunction(materialId, parentIds, {
    deleteAllForOwner: async (id) => {
      await db.deleteFrom("material_relations").where("child_material_id", "=", id).execute();
    },
    insertMany: async (id, relatedIds) => {
      await db
        .insertInto("material_relations")
        .values(relatedIds.map((parentId) => ({ child_material_id: id, parent_material_id: parentId })))
        .execute();
    },
  });
}

export async function findParentIds(materialId: number): Promise<number[]> {
  const rows = await db
    .selectFrom("material_relations")
    .select("parent_material_id")
    .where("child_material_id", "=", materialId)
    .where("deleted_at", "is", null)
    .execute();
  return rows.map((r) => r.parent_material_id);
}

export async function findChildIdsRecursive(materialId: number): Promise<number[]> {
  // Real recursion via MySQL 8 recursive CTE (matches original's *Recursive naming).
  const rows = await db
    .withRecursive("descendants", (qb) =>
      qb
        .selectFrom("material_relations")
        .select(["child_material_id as id"])
        .where("parent_material_id", "=", materialId)
        .where("deleted_at", "is", null)
        .unionAll((qb2) =>
          qb2
            .selectFrom("material_relations as mr")
            .innerJoin("descendants as d", "d.id", "mr.parent_material_id")
            .select(["mr.child_material_id as id"])
            .where("mr.deleted_at", "is", null),
        ),
    )
    .selectFrom("descendants")
    .select("id")
    .execute();
  return rows.map((r) => r.id as number);
}

// --- Business-rule guards (used by validation) ------------------------------

export async function findInTransaction(
  materialId: number,
): Promise<Pick<Selectable<MaterialsTable>, "consumption_unit_per_distribution_unit" | "is_managed_in_batch" | "is_temperature_sensitive"> | undefined> {
  return db
    .selectFrom("ws_materials as wm")
    .innerJoin("ws_stocks as ws", "ws.material_id", "wm.id")
    .where("wm.global_id", "=", materialId)
    .where("ws.deleted_at", "is", null)
    .select(["wm.consumption_unit_per_distribution_unit", "wm.is_managed_in_batch", "wm.is_temperature_sensitive"])
    .limit(1)
    .executeTakeFirst();
}

export async function findInStockOpname(
  materialId: number,
): Promise<Pick<Selectable<MaterialsTable>, "is_stock_opname_mandatory"> | undefined> {
  return db
    .selectFrom("ws_materials as wm")
    .innerJoin("ws_stock_opnames as wso", "wso.material_id", "wm.id")
    .where("wm.global_id", "=", materialId)
    .where("wso.deleted_at", "is", null)
    .select("wm.is_stock_opname_mandatory")
    .limit(1)
    .executeTakeFirst();
}
