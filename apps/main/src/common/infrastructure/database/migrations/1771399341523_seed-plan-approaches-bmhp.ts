import { sql, type Kysely } from "kysely"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db
    .insertInto("plan_approaches")
    .values({
      id: 4,
      name: "BMHP",
      created_at: sql`CURRENT_TIMESTAMP`,
      updated_at: sql`CURRENT_TIMESTAMP`,
    })
    .onDuplicateKeyUpdate({
      name: sql`VALUES(name)`,
      updated_at: sql`CURRENT_TIMESTAMP`,
    })
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.deleteFrom("plan_approaches").where("id", "=", 4).execute()
}
