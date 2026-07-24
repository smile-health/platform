import type { Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropIndex("idx_entity_year_examination")
    .on("ws_bmhp_planning")
    .ifExists()
    .execute()

  // Get table metadata to check for column existence
  const tables = await db.introspection.getTables()
  const table = tables.find((it) => it.name === "ws_bmhp_planning")
  const columnNames = table?.columns.map((it) => it.name) || []

  // Handle year column drop
  if (columnNames.includes("year")) {
    await db.schema
      .alterTable("ws_bmhp_planning")
      .dropColumn("year")
      .execute()
  }

  // Handle approval_period_id column addition
  if (!columnNames.includes("approval_period_id")) {
    await db.schema
      .alterTable("ws_bmhp_planning")
      .addColumn("approval_period_id", "bigint")
      .execute()
  }

  // Handle foreign key constraint
  try {
    await db.schema
      .alterTable("ws_bmhp_planning")
      .addForeignKeyConstraint(
        "ws_bmhp_planning_period_fk",
        ["approval_period_id"],
        "ws_bmhp_approval_periods",
        ["id"]
      )
      .execute()
  } catch (e) {
    // Ignore if constraint already exists
  }

  // Handle unique index
  await db.schema
    .createIndex("idx_entity_period_examination")
    .on("ws_bmhp_planning")
    .columns(["entity_id", "approval_period_id", "examination_id"])
    .unique()
    .ifNotExists()
    .execute()
}



// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .dropIndex("idx_entity_period_examination")
    .on("ws_bmhp_planning")
    .ifExists()
    .execute()

  await db.schema
    .alterTable("ws_bmhp_planning")
    .dropConstraint("ws_bmhp_planning_period_fk")
    .execute()

  await db.schema
    .alterTable("ws_bmhp_planning")
    .dropColumn("approval_period_id")
    .addColumn("year", "integer", (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex("idx_entity_year_examination")
    .on("ws_bmhp_planning")
    .columns(["entity_id", "year", "examination_id"])
    .unique()
    .execute()
}

