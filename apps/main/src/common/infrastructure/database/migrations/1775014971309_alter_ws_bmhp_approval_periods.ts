import type { Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Get table metadata to check for column existence
  const tables = await db.introspection.getTables()
  const table = tables.find((it) => it.name === "ws_bmhp_approval_periods")
  const columnNames = table?.columns.map((it) => it.name) || []

  // Handle year column drop
  if (columnNames.includes("year")) {
    await db.schema
      .alterTable("ws_bmhp_approval_periods")
      .dropColumn("year")
      .execute()
  }

  // Handle program_plan_id column addition
  if (!columnNames.includes("program_plan_id")) {
    await db.schema
      .alterTable("ws_bmhp_approval_periods")
      .addColumn("program_plan_id", "bigint")
      .execute()
  }

  // Handle foreign key constraint
  try {
    await db.schema
      .alterTable("ws_bmhp_approval_periods")
      .addForeignKeyConstraint(
        "ws_bmhp_ap_program_plan_fk",
        ["program_plan_id"],
        "ws_program_plans",
        ["id"]
      )
      .execute()
  } catch (e) {
    // Ignore if constraint already exists
  }
}


// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .dropConstraint("ws_bmhp_ap_program_plan_fk")
    .execute()

  await db.schema
    .alterTable("ws_bmhp_approval_periods")
    .dropColumn("program_plan_id")
    .addColumn("year", "integer", (col) => col.notNull())
    .execute()
}


