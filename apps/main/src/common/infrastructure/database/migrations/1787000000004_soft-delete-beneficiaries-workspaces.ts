import { Kysely } from "kysely"
import { Database } from "../types/index.js"

const KEYS = ["dengue_beneficiaries", "immunization_beneficiaries"]

export async function up(db: Kysely<Database>): Promise<void> {
  await db
    .updateTable("workspaces")
    .set({ deleted_at: new Date() })
    .where("key", "in", KEYS)
    .where("deleted_at", "is", null)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db
    .updateTable("workspaces")
    .set({ deleted_at: null })
    .where("key", "in", KEYS)
    .execute()
}
