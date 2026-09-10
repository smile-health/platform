import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

// Backfills the materialized ancestor path (root-to-self, ids joined by '#',
// e.g. "1#23#2345") for all existing locations rows.
// `level` is bounded 0-3 (province/regency/sub_district/village), so this is
// done as 4 explicit passes rather than a generic recursive loop.
export async function up(db: Kysely<Database>): Promise<void> {
  // Level 0 (province): no parent, path is just its own id.
  await sql`
    UPDATE locations
    SET path = CAST(id AS CHAR)
    WHERE level = 0
  `.execute(db)

  // Level 1 (regency): path = parent (province) path + '#' + own id.
  await sql`
    UPDATE locations AS child
    INNER JOIN locations AS parent ON parent.id = child.parent_id
    SET child.path = CONCAT(parent.path, '#', child.id)
    WHERE child.level = 1
  `.execute(db)

  // Level 2 (sub_district): path = parent (regency) path + '#' + own id.
  await sql`
    UPDATE locations AS child
    INNER JOIN locations AS parent ON parent.id = child.parent_id
    SET child.path = CONCAT(parent.path, '#', child.id)
    WHERE child.level = 2
  `.execute(db)

  // Level 3 (village): path = parent (sub_district) path + '#' + own id.
  await sql`
    UPDATE locations AS child
    INNER JOIN locations AS parent ON parent.id = child.parent_id
    SET child.path = CONCAT(parent.path, '#', child.id)
    WHERE child.level = 3
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`
    UPDATE locations SET path = NULL
  `.execute(db)
}
