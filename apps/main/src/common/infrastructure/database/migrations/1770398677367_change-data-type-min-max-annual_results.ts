import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_annual_need_results
		MODIFY COLUMN \`min\` DOUBLE,
      	MODIFY COLUMN \`max\` DOUBLE;
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_annual_need_results
      	MODIFY COLUMN \`min\` BIGINT,
      	MODIFY COLUMN \`max\` BIGINT;
	`.execute(db)
}
