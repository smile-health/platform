import type { Kysely } from "kysely"
import { DB } from "../types/db.js"

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<DB>): Promise<void> {
  try {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .addColumn("original_target", "integer", (col) =>
        col.notNull().defaultTo(0)
      )
      .execute()
  } catch {
    /* column may already exist from partial run */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .addColumn("adjusted_target", "integer", (col) => col)
      .execute()
  } catch {
    /* column may already exist from partial run */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .addColumn("verification_status", "smallint", (col) => col.defaultTo(0))
      .execute()
  } catch {
    /* column may already exist from partial run */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .addColumn("revision_note", "text", (col) => col)
      .execute()
  } catch {
    /* column may already exist from partial run */
  }

  try {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .addColumn("verified_by", "bigint")
      .execute()
  } catch {
    /* column may already exist from partial run */
  }

  await db.schema
    .alterTable("ws_bmhp_planning_target_groups")
    .addColumn("verified_at", "datetime")
    .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
  const columns = [
    "original_target",
    "adjusted_target",
    "verification_status",
    "revision_note",
    "verified_by",
    "verified_at",
  ]
  for (const col of columns) {
    await db.schema
      .alterTable("ws_bmhp_planning_target_groups")
      .dropColumn(col)
      .execute()
  }
}
