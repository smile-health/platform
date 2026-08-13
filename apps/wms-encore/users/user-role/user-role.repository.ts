// Postgres columns for table `user_role` (mirrors
// apps/wms-service's infrastructure/database/models/UserRoleModel.ts,
// a Sequelize model with `paranoid: true` soft-deletes):
//
//   id            integer, unsigned, auto-increment, primary key
//   created_by    varchar(36), not null
//   updated_by    varchar(36), not null
//   region_id     integer, not null
//   name          varchar(64), not null
//   name_en       varchar(64), not null
//   description   varchar(255), nullable
//   type          varchar(64), not null
//   created_at    timestamp, not null (Sequelize `timestamps: true`)
//   updated_at    timestamp, not null (Sequelize `timestamps: true`)
//   deleted_at    timestamp, nullable (Sequelize `paranoid: true`)
//   deleted_by    bigint, nullable
//
// Indexes: PRIMARY KEY on `id` (BTREE).

import { db } from "../../db/db";
import type { PaginatedUserRoles, UserRole } from "./user-role.types";

function toEntity(row: {
  id: number;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  name_en: string;
  type: string;
  description: string | null;
  region_id: number;
}): UserRole {
  return {
    id: row.id,
    createdBy: row.created_by,
    updatedBy: row.updated_by ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
    name: row.name,
    type: row.type,
    description: row.description ?? undefined,
    regionId: row.region_id,
  };
}

export async function findPaginated(params: {
  limit: number;
  page: number;
  search?: string;
  lang?: string;
}): Promise<PaginatedUserRoles> {
  let query = db.selectFrom("user_role").where("deleted_at", "is", null);
  if (params.search) {
    query = query.where((eb) =>
      eb.or([
        eb("name", "ilike", `%${params.search}%`),
        eb("name_en", "ilike", `%${params.search}%`),
      ]),
    );
  }

  const countRow = await query
    .select((eb) => eb.fn.countAll<string>().as("count"))
    .executeTakeFirst();
  const total = Number(countRow?.count ?? 0);

  const rows = await query
    .selectAll()
    .orderBy("id", "asc")
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute();

  const data = rows.map((row) => {
    const entity = toEntity(row);
    // Original: `if (lang === 'en' && data.nameEn) { base.name = data.nameEn; }`
    if (params.lang === "en" && row.name_en) {
      entity.name = row.name_en;
    }
    return entity;
  });

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
