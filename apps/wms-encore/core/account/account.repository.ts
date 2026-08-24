// Ported from apps/core/src/modules/account/account.repository.ts — findByID
// reads "users" (see ../user/user.repository.ts for the fuller user CRUD);
// the rest is login-attempt rate-limit tracking against "login_attempts".
import { sql, type Selectable } from "kysely";
import { db } from "../db";
import type { UsersTable, LoginAttemptsTable } from "../db.types";

export type AccountRow = Selectable<UsersTable>;
export type LoginAttemptRow = Selectable<LoginAttemptsTable>;

export async function findById(id: number): Promise<AccountRow> {
  return db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirstOrThrow() as Promise<AccountRow>;
}

export async function createLoginAttempt(data: { ip: string; hit?: number }): Promise<void> {
  await db.insertInto("login_attempts").values(data).execute();
}

export async function updateLoginAttempt(data: { ip: string; hit?: number }): Promise<void> {
  await db
    .updateTable("login_attempts")
    .set(data)
    .where("ip", "=", data.ip)
    .execute();
}

export async function incrementLoginAttempt(ip: string): Promise<void> {
  await db
    .updateTable("login_attempts")
    .set({ hit: sql`hit + 1`, last_attempt: sql`NOW()` })
    .where("ip", "=", ip)
    .execute();
}

export async function findIpLoginAttempt(ip: string): Promise<Pick<LoginAttemptRow, "hit" | "last_attempt"> | undefined> {
  return db
    .selectFrom("login_attempts")
    .select(["hit", "last_attempt"])
    .where("ip", "=", ip)
    .executeTakeFirst() as Promise<Pick<LoginAttemptRow, "hit" | "last_attempt"> | undefined>;
}
