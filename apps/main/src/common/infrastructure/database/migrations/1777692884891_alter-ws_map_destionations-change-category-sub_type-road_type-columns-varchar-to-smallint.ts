import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_map_destinations
		CHANGE type category SMALLINT,
		MODIFY sub_type SMALLINT,
		MODIFY road_type SMALLINT
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_map_destinations
		CHANGE category type VARCHAR(20),
		MODIFY sub_type VARCHAR(25) ,
		MODIFY road_type VARCHAR(10) 
	`.execute(db)
}
