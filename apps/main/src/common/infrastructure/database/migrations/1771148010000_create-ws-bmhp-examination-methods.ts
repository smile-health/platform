import type { Kysely } from "kysely"
import type { Database } from "../types/index.js"
import { sql } from "kysely"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_bmhp_examination_methods")
    .addColumn("id", "integer", (col) =>
      col.autoIncrement().primaryKey().unsigned()
    )
    .addColumn("examination_id", "integer", (col) =>
      col.unsigned().notNull().references("bmhp_examinations.id")
    )
    .addColumn("method_id", "integer", (col) =>
      col.unsigned().notNull().references("bmhp_examination_methods.id")
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addUniqueConstraint("examination_id_method_id_unique", [
      "examination_id",
      "method_id",
    ])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_bmhp_examination_methods").execute()
}
