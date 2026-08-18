// Postgres columns for table `asset_dongle` (mirrors
// infrastructure/database/models/AssetDongleModel.ts field-for-field):
//
//   asset_id    integer, unsigned, autoIncrement:true, primary key
//               (in practice always supplied explicitly by the caller on
//               create — see asset-dongle.types.ts's note; wire type stays
//               string end-to-end, same as the original)
//   created_at  timestamp, not null, default now()
//   updated_at  timestamp, not null, default now()
//   deleted_at  timestamp, nullable (paranoid soft-delete)
//   deleted_by  bigint, nullable
//
// deleteAssetDongle also touches `healthcare_asset` (mirrors the original's
// side effect of nulling out the referencing row before destroying the
// asset_dongle row):
//
//   healthcare_asset.id         integer, unsigned, autoIncrement, primary key
//   healthcare_asset.asset_id   varchar(64), nullable — FK-ish reference to
//                                asset_dongle.asset_id

import { db } from "../db";
import type { AssetDongle, PaginationMeta } from "./asset-dongle.types";

function toEntity(row: {
  asset_id: string | number;
  created_at: Date;
  updated_at: Date;
}): AssetDongle {
  return {
    assetId: String(row.asset_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findById(assetId: string): Promise<AssetDongle | null> {
  const row = await db
    .selectFrom("asset_dongle")
    .selectAll()
    .where("asset_id", "=", assetId)
    .where("deleted_at", "is", null)
    .executeTakeFirst();
  return row ? toEntity(row) : null;
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
}): Promise<{ data: AssetDongle[]; pagination: PaginationMeta }> {
  let query = db.selectFrom("asset_dongle").where("deleted_at", "is", null);
  if (params.search) {
    // Original used Op.like (case-sensitive on Postgres); using ILIKE here
    // per this port's case-insensitive-search convention.
    query = query.where("asset_id", "ilike", `%${params.search}%`);
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

export async function create(assetId: string): Promise<AssetDongle> {
  const row = await db
    .insertInto("asset_dongle")
    .values({ asset_id: assetId })
    .returningAll()
    .executeTakeFirstOrThrow();
  return toEntity(row);
}

export async function deleteAssetDongle(assetId: string, deletedBy?: number): Promise<boolean> {
  const existing = await findById(assetId);
  if (!existing) return false;

  // Mirrors the original: null out the referencing healthcare_asset row
  // before destroying the asset_dongle row.
  await db
    .updateTable("healthcare_asset")
    .set({ asset_id: null })
    .where("asset_id", "=", assetId)
    .execute();

  if (deletedBy) {
    await db
      .updateTable("asset_dongle")
      .set({ deleted_by: deletedBy })
      .where("asset_id", "=", assetId)
      .execute();
  }

  await db
    .updateTable("asset_dongle")
    .set({ deleted_at: new Date() })
    .where("asset_id", "=", assetId)
    .where("deleted_at", "is", null)
    .execute();

  return true;
}
