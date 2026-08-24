import { sql } from "kysely";
import { db } from "./db";

export interface WmsAsset {
  id: number;
  assetId: string | null;
  entityId: number;
}

// Mirrors CleanseAssetDongleWasteScale.ts's WMS-side page query. The
// original filtered `healthcare_facility_id IN (:entityIds)` when entityIds
// was supplied, but HealthcareAssetModel maps the facility column to
// `entity_id` (matches db.ts's HealthcareAssetTable) — `healthcare_facility_id`
// isn't a real column on this table. That looks like a bug in the original
// (see the porting research notes), not an intentional quirk, so this port
// filters on the real column `entity_id` instead of reproducing what would
// likely be a broken/no-op filter or an outright unknown-column error.
export async function findWasteScaleAssets(
  entityIds: number[] | undefined,
  limit: number,
  offset: number,
): Promise<WmsAsset[]> {
  const entityFilter =
    entityIds && entityIds.length > 0 ? sql`AND entity_id = ANY(${entityIds})` : sql``;

  const result = await sql<WmsAsset>`
    SELECT id, asset_id AS "assetId", entity_id AS "entityId"
    FROM healthcare_asset
    WHERE asset_type_name = 'Waste Scale'
    AND deleted_at IS NULL
    ${entityFilter}
    ORDER BY entity_id ASC
    LIMIT ${limit} OFFSET ${offset}
  `.execute(db);

  return result.rows;
}

export type CleanseAction =
  | { type: "replace_id"; oldId: number; newId: number }
  | { type: "update_asset_id"; id: number; assetId: string }
  | { type: "delete"; ids: number[] };

// Mirrors executeActions. `delete` is a soft delete (deleted_at, matching
// the original's Sequelize `paranoid: true` model — `destroy()` there never
// hard-deletes). `replace_id` mutates the primary key in place, same as the
// original's `HealthcareAssetModel.update({ id: newId }, ...)` — unusual,
// preserved faithfully rather than "fixed" since changing it would change
// which row downstream references resolve to.
export async function executeCleanseAction(action: CleanseAction): Promise<void> {
  if (action.type === "delete") {
    if (action.ids.length === 0) return;
    await db
      .updateTable("healthcare_asset")
      .set({ deleted_at: new Date() })
      .where("id", "in", action.ids)
      .execute();
    return;
  }
  if (action.type === "replace_id") {
    await db
      .updateTable("healthcare_asset")
      .set({ id: action.newId })
      .where("id", "=", action.oldId)
      .execute();
    return;
  }
  await db
    .updateTable("healthcare_asset")
    .set({ asset_id: action.assetId })
    .where("id", "=", action.id)
    .execute();
}
