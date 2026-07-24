import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE ws_environmental_tests CHANGE COLUMN ikl_qualified has_ikl boolean`.execute(
    db
  )
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`ALTER TABLE ws_environmental_tests CHANGE COLUMN has_ikl ikl_qualified boolean`.execute(
    db
  )
}
