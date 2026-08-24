// Ported from apps/core/src/modules/user — CRUD only. See db.types.ts's
// UsersTable note re: village_id removal. Password hashing (bcrypt in the
// original) is NOT ported — see user.controller.ts's TODO.
import { db } from "../db";
import type { UsersTable } from "../db.types";
import type { Selectable, Insertable, Updateable } from "kysely";

export type UserRow = Selectable<UsersTable>;

export async function findById(userId: number): Promise<UserRow | undefined> {
  return db
    .selectFrom("users")
    .selectAll()
    .where("id", "=", userId)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<UserRow | undefined>;
}

export async function findByUsername(username: string): Promise<UserRow | undefined> {
  return db
    .selectFrom("users")
    .selectAll()
    .where("username", "=", username)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<UserRow | undefined>;
}

export async function findByEmail(email: string): Promise<UserRow | undefined> {
  return db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .where("deleted_at", "is", null)
    .executeTakeFirst() as Promise<UserRow | undefined>;
}

export async function list(params: { limit: number; page: number; search?: string }): Promise<UserRow[]> {
  let query = db.selectFrom("users").selectAll().where("deleted_at", "is", null);
  if (params.search) {
    query = query.where("username", "like", `%${params.search}%`);
  }
  return query
    .limit(params.limit)
    .offset((params.page - 1) * params.limit)
    .execute() as Promise<UserRow[]>;
}

export async function create(data: Insertable<UsersTable>, createdBy: number): Promise<number> {
  const result = await db
    .insertInto("users")
    .values({ ...data, created_by: createdBy })
    .executeTakeFirstOrThrow();
  return Number(result.insertId);
}

export async function update(userId: number, data: Updateable<UsersTable>, updatedBy: number): Promise<void> {
  await db
    .updateTable("users")
    .set({ ...data, updated_by: updatedBy, updated_at: new Date() })
    .where("id", "=", userId)
    .execute();
}

export async function softDelete(userId: number, deletedBy: number): Promise<void> {
  await db
    .updateTable("users")
    .set({ deleted_at: new Date(), deleted_by: deletedBy })
    .where("id", "=", userId)
    .execute();
}
