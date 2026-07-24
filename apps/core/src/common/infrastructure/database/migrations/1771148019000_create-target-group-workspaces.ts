import { Kysely } from "kysely"
import { addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("target_group_workspaces")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("target_group_id", "bigint", (col) => col.notNull())
    .addColumn("program_id", "bigint")
    .$call(addTimestampColumns)
    .execute()

  await db.schema
    .createIndex("target_group_workspaces_target_group_id_index")
    .on("target_group_workspaces")
    .column("target_group_id")
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("target_group_workspaces").execute()
}
