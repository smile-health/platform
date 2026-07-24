import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_mp_program_config")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("year", "integer", (col) => col.notNull())
    .addColumn("program_id", "bigint", (col) => col.notNull())
    .addColumn("category", sql`ENUM('non_bias','bias')`, (col) => col.notNull())
    .addColumn("status", "smallint", (col) => col.notNull().defaultTo(0))
    .addColumn("seeded_from_plan_id", "bigint")
    .addColumn("seeded_at", "timestamp")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await sql`
    ALTER TABLE ws_mp_program_config
    ADD UNIQUE KEY ws_mp_program_config_year_idx (year, program_id, category)
  `.execute(db)

  await db.schema
    .createIndex("ws_mp_program_config_status_idx")
    .on("ws_mp_program_config")
    .columns(["status", "deleted_at"])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_mp_program_config").execute()
}
