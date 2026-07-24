import { sql, type Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // Create ws_bmhp_approval_signature table
  await db.schema
    .createTable("ws_bmhp_approval_signature")
    .addColumn("id", "integer", (col) => col.unsigned().autoIncrement().primaryKey())
    .addColumn("user_id", "bigint", (col) => col.notNull())
    .addColumn("approval_period_id", "bigint", (col) => col.notNull())
    .addColumn("entity_id", "bigint", (col) => col.notNull())
    .addColumn("desk_result_id", "bigint")
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop ws_bmhp_approval_signature table
  await db.schema.dropTable("ws_bmhp_approval_signature").execute()
}
