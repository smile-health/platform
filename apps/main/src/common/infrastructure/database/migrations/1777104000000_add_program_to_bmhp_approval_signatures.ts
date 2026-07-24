import type { Kysely } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // Add program column to bmhp_approval_signatures table
  await db.schema
    .alterTable("bmhp_approval_signatures")
    .addColumn("program", "varchar(255)", (col) => col.defaultTo(null))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove program column from bmhp_approval_signatures table
  await db.schema
    .alterTable("bmhp_approval_signatures")
    .dropColumn("program")
    .execute()
}
