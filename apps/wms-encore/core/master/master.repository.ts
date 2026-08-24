// Ported from apps/core/src/modules/master/master.repository.ts — this
// module is really just location lookups against the (already generic!)
// `locations` table, not a bespoke "master data" schema of its own.
import { db } from "../db";
import type { LocationsTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type LocationRow = Selectable<LocationsTable>;

export async function getLocations(params: {
  level: number;
  parentIds?: number[];
  keyword?: string;
  limit: number;
  page: number;
}): Promise<LocationRow[]> {
  let query = db.selectFrom("locations").selectAll().where("level", "=", params.level);
  if (params.parentIds?.length) {
    query = query.where("parent_id", "in", params.parentIds);
  }
  if (params.keyword) {
    query = query.where("name", "like", `%${params.keyword}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<LocationRow[]>;
}

export async function findLocationsByIds(locationIds: number[]): Promise<LocationRow[]> {
  return db.selectFrom("locations").selectAll().where("id", "in", locationIds).execute() as Promise<LocationRow[]>;
}
