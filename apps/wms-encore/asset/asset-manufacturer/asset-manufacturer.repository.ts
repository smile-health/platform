// Postgres columns for table `asset_manufacturer` (mirrors
// infrastructure/database/models/AssetManufacturerModel.ts field-for-field):
//
//   id            integer, unsigned, auto-increment, primary key
//   created_by    varchar(36), not null
//   updated_by    varchar(36), not null
//   name          varchar(64), not null
//   description   varchar(255), nullable
//   created_at    timestamp, not null
//   updated_at    timestamp, not null
//   deleted_at    timestamp, nullable (paranoid soft-delete)
//   deleted_by    bigint, nullable

import { db } from "../../db/db";
import type { AssetManufacturer, PaginationMeta } from "./asset-manufacturer.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}): AssetManufacturer {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findById(id: number): Promise<AssetManufacturer | null> {
  const row = await db
    .selectFrom("asset_manufacturer")
    .selectAll()
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findByName(name: string): Promise<AssetManufacturer | null> {
  // Mirrors findAssetManufacturerByCondition({ name }) as used by
  // CreateAssetManufacturer.ts's duplicate-name check.
  const row = await db
    .selectFrom("asset_manufacturer")
    .selectAll()
    .where("name", "=", name)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  name?: string;
}): Promise<{ data: AssetManufacturer[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("asset_manufacturer").where("deleted_at", "is", null);

  // Mirrors the original's `[Op.or]: [{ name: { [Op.like]: `%search%` } }, { description: { [Op.like]: `%search%` } }]`
  // (ported to Postgres ILIKE for case-insensitivity), ANDed with the exact
  // `name` filter below when both are supplied.
  if (params.search) {
    query = query.where((eb) =>
      eb.or([eb("name", "ilike", `%${params.search}%`), eb("description", "ilike", `%${params.search}%`)])
    );
  }
  // Original: `name && name.length > 2` -> exact-match filter (not part of
  // the search LIKE clause) — preserved verbatim, including the arbitrary
  // length > 2 guard.
  if (params.name && params.name.length > 2) {
    query = query.where("name", "=", params.name);
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

export async function create(payload: {
  createdBy: string;
  name: string;
  description?: string;
}): Promise<AssetManufacturer> {
  // Mirrors the original: updated_by set to createdBy on create.
  const row = await db
    .insertInto("asset_manufacturer")
    .values({
      created_by: payload.createdBy,
      updated_by: payload.createdBy,
      name: payload.name,
      description: payload.description ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function update(
  id: number,
  payload: { updatedBy: string; name: string; description?: string }
): Promise<AssetManufacturer | null> {
  const existing = await findById(id);
  if (!existing) return null;

  const row = await db
    .updateTable("asset_manufacturer")
    .set({
      updated_at: new Date(),
      updated_by: payload.updatedBy,
      name: payload.name,
      description: payload.description ?? null,
    })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .returningAll()
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function softDelete(id: number, deletedBy?: number): Promise<boolean> {
  const existing = await findById(id);
  if (!existing) return false;

  await db
    .updateTable("asset_manufacturer")
    .set({ deleted_at: new Date(), deleted_by: deletedBy ?? null })
    .where("id", "=", id)
    .where("deleted_at", "is", null)
    .execute();
  return true;
}
