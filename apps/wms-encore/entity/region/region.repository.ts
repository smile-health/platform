import { db } from "../../db/db";
import type { Region } from "./region.types";

function toRegion(row: {
  id: number;
  code: string;
  name: string;
  region_type: Region["regionType"];
  parent_id: number | null;
  created_by: string;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date | null;
}): Region {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    regionType: row.region_type,
    parentId: row.parent_id ?? undefined,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function findRegionById(id: number): Promise<Region | null> {
  const row = await db.selectFrom("regions").selectAll().where("id", "=", id).executeTakeFirst();
  return row ? toRegion(row) : null;
}

// Ported as-is from RegionRepositoryImpl.getValidationDistanceLimit — the original
// is already a stub (`return true`, no real geo/entity lookup implemented), not a
// simplification introduced here. Real geo-distance-limit logic is still owed
// upstream in wms-service; porting it here means implementing it for the first
// time, which is out of scope for this module's migration.
export async function getValidationDistanceLimit(
  _lat1: number,
  _lon1: number,
  _lat2: number,
  _lon2: number,
  _type: string,
  _entityId: number
): Promise<boolean> {
  return true;
}
