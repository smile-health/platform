import { Kysely, sql } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import type { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_mp_material_substitution")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("mp_program_config_id", "bigint", (col) => col.notNull())
    .addColumn("material_id", "bigint", (col) => col.notNull())
    .addColumn("substitution_material_id", "bigint", (col) => col.notNull())
    .addColumn("priority", "smallint", (col) => col.notNull().defaultTo(1))
    .addColumn("source_ref_id", "bigint")
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .alterTable("ws_mp_material_substitution")
    .addForeignKeyConstraint(
      "ws_mp_ms_program_config_fk",
      ["mp_program_config_id"],
      "ws_mp_program_config",
      ["id"]
    )
    .onDelete("restrict")
    .execute()

  await sql`
    ALTER TABLE ws_mp_material_substitution
    ADD UNIQUE KEY ws_mp_ms_unique (mp_program_config_id, material_id, substitution_material_id)
  `.execute(db)

  await db.schema
    .createIndex("ws_mp_ms_material_idx")
    .on("ws_mp_material_substitution")
    .column("material_id")
    .execute()

  await db.schema
    .createIndex("ws_mp_ms_program_config_idx")
    .on("ws_mp_material_substitution")
    .column("mp_program_config_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_mp_material_substitution").execute()
}
