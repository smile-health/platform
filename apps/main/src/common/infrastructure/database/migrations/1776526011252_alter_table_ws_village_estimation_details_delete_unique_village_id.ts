import { Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE ws_village_estimation_details DROP INDEX village_id`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE ws_village_estimation_details ADD UNIQUE INDEX village_id (village_id)`.execute(db)
}
