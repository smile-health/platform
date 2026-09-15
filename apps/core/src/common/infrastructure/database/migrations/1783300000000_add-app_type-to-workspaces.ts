import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("workspaces")
    .addColumn("app_type", "varchar(32)", (col) =>
      col.notNull().defaultTo("logistic")
    )
    .execute()

  await sql`
    ALTER TABLE workspaces ADD INDEX idx_workspaces_app_type (app_type);
  `.execute(db)

  await db
    .updateTable("workspaces")
    .set({ app_type: "waste_management" })
    .where("id", "=", 999)
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropIndex("idx_workspaces_app_type").execute()
  await db.schema.alterTable("workspaces").dropColumn("app_type").execute()
}
