import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("executive_workspaces")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("key", "varchar(255)", (col) => col.notNull())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("config", "text")
    .addColumn("description", "varchar(255)")
    .addColumn("program_uuid", "varchar(255)")
    .addColumn("is_beneficiaries", "boolean", (col) => col.defaultTo(false))
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  await db.schema
    .createIndex("idx_executive_workspaces_key")
    .on("executive_workspaces")
    .column("key")
    .execute()

  await db.schema
    .createIndex("idx_executive_workspaces_name")
    .on("executive_workspaces")
    .column("name")
    .execute()

  await db.schema
    .createIndex("idx_executive_workspaces_program_uuid")
    .on("executive_workspaces")
    .column("program_uuid")
    .execute()

  const workspaces = await db
    .selectFrom("workspaces")
    .selectAll()
    .where("deleted_at", "is", null)
    .execute()

  workspaces.push({
    id: 0,
    key: "wms",
    name: "WMS",
    config: JSON.stringify({
      material: {
        is_hierarchy_enabled: false,
        is_batch_enabled: false,
      },
      color: "#000000",
    }),
    description: null,
    program_uuid: "d875b44e-9424-48cb-8ea5-4bd0c8563051",
    is_beneficiaries: 0,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    created_by: null,
    updated_by: 1,
    deleted_by: 1,
  })

  for (const workspace of workspaces) {
    await db
      .insertInto("executive_workspaces")
      .values({
        key: workspace.key,
        name: workspace.name,
        config: JSON.stringify(workspace.config),
        description: workspace.description,
        program_uuid: workspace.program_uuid,
        is_beneficiaries: workspace.is_beneficiaries,
      })
      .execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("executive_workspaces").execute()
}
