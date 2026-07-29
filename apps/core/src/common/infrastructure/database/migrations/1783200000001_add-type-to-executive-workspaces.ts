import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("executive_workspaces")
    .addColumn("type", "varchar(20)", (col) =>
      col.notNull().defaultTo("smile")
    )
    .execute()

  await db
    .updateTable("executive_workspaces")
    .set({ type: "wms" })
    .where("key", "in", ["wms", "dummywms"])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.alterTable("executive_workspaces").dropColumn("type").execute()
}
