import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("executive_users_workspaces")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("user_id", "bigint", (col) => col.notNull())
    .addColumn("workspace_id", "integer", (col) => col.notNull())
    .addColumn("status", "boolean", (col) => col.defaultTo(true))
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  await db.schema
    .createIndex("idx_executive_users_workspaces_user_id")
    .on("executive_users_workspaces")
    .column("user_id")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_workspaces_workspace_id")
    .on("executive_users_workspaces")
    .column("workspace_id")
    .execute()

  await db.schema
    .createIndex("idx_executive_users_workspaces_status")
    .on("executive_users_workspaces")
    .column("status")
    .execute()

  const executiveWorkspaces = await db
    .selectFrom("executive_workspaces")
    .select("id")
    .execute()

  const executiveUsers = await db
    .selectFrom("executive_users")
    .select("id")
    .execute()

  for (const user of executiveUsers) {
    for (const workspace of executiveWorkspaces) {
      await db
        .insertInto("executive_users_workspaces")
        .values({
          user_id: user.id,
          workspace_id: workspace.id,
          status: true,
        })
        .execute()
    }
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("executive_users_workspaces").execute()
}
