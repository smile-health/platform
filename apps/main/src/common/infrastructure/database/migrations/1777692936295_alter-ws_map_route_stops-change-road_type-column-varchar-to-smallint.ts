import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_map_route_stops
		MODIFY road_type SMALLINT
	`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
		ALTER TABLE ws_map_route_stops
		MODIFY road_type VARCHAR(10) 
	`.execute(db)
}
