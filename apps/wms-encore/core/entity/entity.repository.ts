// Ported from apps/core/src/modules/entity/entity.repository.ts — covers
// CRUD, code lookup, program (workspace) association, and the
// customer/vendor relation guard used before letting an entity's type
// change. NOT ported (larger, left as a follow-up): getActiveEntities,
// getListEntity's full filter set (province/regency/etc. filters no longer
// apply — see entity.schema.ts), findAllSearchableAndStreamable, cache
// invalidation (originally via redis).
import { db } from "../db";
import type { EntitiesTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";
import { syncJunction } from "../../shared/db/junction";

export type EntityRow = Selectable<EntitiesTable>;

export async function findById(entityId: number): Promise<EntityRow | undefined> {
  return db
    .selectFrom("entities")
    .selectAll()
    .where("id", "=", entityId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
}

export async function findByCode(code: string, excludeId?: number): Promise<EntityRow | undefined> {
  let query = db.selectFrom("entities").selectAll().where("code", "=", code);
  if (excludeId) query = query.where("id", "!=", excludeId);
  return query.executeTakeFirst();
}

export async function list(params: { limit: number; page: number; search?: string; type?: number }): Promise<{ data: EntityRow[]; total: number }> {
  let query = db.selectFrom("entities").where("deleted_at", "is", null);
  if (params.search) {
    query = query.where((eb) => eb.or([eb("name", "like", `%${params.search}%`), eb("code", "like", `%${params.search}%`)]));
  }
  if (params.type !== undefined) {
    query = query.where("type", "=", params.type);
  }
  const [data, countRow] = await Promise.all([
    query
      .selectAll()
      .limit(params.limit)
      .offset((params.page - 1) * params.limit)
      .execute(),
    query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow(),
  ]);
  return { data, total: Number(countRow.total) };
}

export async function create(
  data: Omit<Insertable<EntitiesTable>, "created_by" | "updated_by">,
  createdBy: number,
): Promise<number> {
  const result = await db
    .insertInto("entities")
    .values({ ...data, created_by: createdBy, updated_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(entityId: number, data: Updateable<EntitiesTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("entities")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", entityId)
    .execute();
}

export async function softDelete(entityId: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("entities")
    .set({ deleted_at: new Date(), updated_by: deletedBy })
    .where("id", "=", entityId)
    .execute();
}

// --- Program (workspace) associations ---------------------------------------
// Same shape as core/material's material_workspaces association — could be
// factored into one shared "entity<->workspace junction" helper if a third
// module needs the identical pattern; not done yet since it's still only 2
// call sites (see the closing discussion on reuse).

export async function setPrograms(entityId: number, programIds: number[]): Promise<void> {
  return syncJunction(entityId, programIds, {
    deleteAllForOwner: async (id) => {
      await db.deleteFrom("entity_workspaces").where("entity_id", "=", id).execute();
    },
    insertMany: async (id, relatedIds) => {
      await db
        .insertInto("entity_workspaces")
        .values(relatedIds.map((workspaceId) => ({ entity_id: id, workspace_id: workspaceId })))
        .execute();
    },
  });
}

export async function getProgramsByEntityIds(entityIds: number[]): Promise<Record<number, number[]>> {
  if (!entityIds.length) return {};
  const rows = await db
    .selectFrom("entity_workspaces")
    .select(["entity_id", "workspace_id"])
    .where("entity_id", "in", entityIds)
    .where("deleted_at", "is", null)
    .execute();
  const grouped: Record<number, number[]> = {};
  for (const row of rows) {
    (grouped[row.entity_id] ??= []).push(row.workspace_id);
  }
  return grouped;
}

// --- Business-rule guard (used by validation) -------------------------------

// True if this entity is referenced as a customer or vendor in any program
// — used to block a type change on an entity that's already in active use.
// Note: ws_customer_vendors.customer_id/vendor_id reference
// entity_workspaces' own row id (the workspace-membership junction row),
// NOT entities.id directly — matches the original's exact join, not a
// simplified direct-id check.
export async function isInCustomerVendorRelation(entityId: number): Promise<boolean> {
  const memberships = await db.selectFrom("entity_workspaces").select("id").where("entity_id", "=", entityId).execute();
  if (memberships.length === 0) return false;
  const membershipIds = memberships.map((m) => m.id);

  const exists = await db
    .selectFrom("ws_customer_vendors")
    .where((eb) => eb("customer_id", "in", membershipIds).or("vendor_id", "in", membershipIds))
    .select("id")
    .limit(1)
    .executeTakeFirst();
  return !!exists;
}
