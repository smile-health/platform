import type { Kysely } from "kysely"
import { Database } from "../types"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .alterTable("budget_sources")
    .addColumn("is_custom", "boolean", (col) => col.defaultTo(false))
    .execute()

  const budgetSource = await db
    .insertInto("budget_sources")
    .values({
      name: "Lainnya",
      is_custom: 1,
    })
    .executeTakeFirstOrThrow()

  await db
    .insertInto("budget_source_workspaces")
    .values({
      budget_source_id: Number(budgetSource.insertId),
      workspace_id: 1,
    })
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  const budgetSource = await db
    .selectFrom("budget_sources")
    .select("id")
    .where("name", "=", "Lainnya")
    .where("is_custom", "=", 1)
    .executeTakeFirst()

  if (budgetSource) {
    await db
      .deleteFrom("budget_source_workspaces")
      .where("budget_source_id", "=", budgetSource.id)
      .where("workspace_id", "=", 1)
      .execute()

    await db
      .deleteFrom("budget_sources")
      .where("id", "=", budgetSource.id)
      .execute()
  }

  await db.schema
    .alterTable("budget_sources")
    .dropColumn("is_custom")
    .execute()
}
