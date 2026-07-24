import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_environmental_tests")
    .addColumn("activity_id", "bigint")
    .execute()

  await db.schema
    .createIndex("idx_ws_environmental_tests_activity_id")
    .on("ws_environmental_tests")
    .column("activity_id")
    .execute()

  await db.schema
    .alterTable("ws_environmental_tests")
    .addForeignKeyConstraint(
      "fk_ws_environmental_tests_activity_id",
      ["activity_id"],
      "ws_activities",
      ["id"]
    )
    .onDelete("set null")
    .onUpdate("cascade")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("ws_environmental_tests")
    .dropConstraint("fk_ws_environmental_tests_activity_id")
    .execute()

  await db.schema
    .dropIndex("idx_ws_environmental_tests_activity_id")
    .execute()

  await db.schema
    .alterTable("ws_environmental_tests")
    .dropColumn("activity_id")
    .execute()
}
