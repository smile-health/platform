import type { Kysely } from "kysely"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Add approval_status (0=ONDESK, 1=Approved, 2=Revision) and notes to ws_program_plans
  await db.schema
    .alterTable("ws_program_plans")
    .addColumn("approval_status", "integer", (col) =>
      col.defaultTo(0).notNull()
    )
    .execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("ws_program_plans")
    .dropColumn("approval_status")
    .execute()
}
