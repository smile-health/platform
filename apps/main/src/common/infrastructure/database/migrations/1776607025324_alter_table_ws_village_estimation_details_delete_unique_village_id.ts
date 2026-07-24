import { type Kysely, sql } from "kysely"

export async function up(db: Kysely<any>): Promise<void> {
  // Cek apakah index ada
  const indexes = await sql<{ Key_name: string }>`
		SHOW INDEX FROM ws_village_estimation_details 
		WHERE Key_name = 'village_id'
	`.execute(db)

  // Hanya drop jika index ada
  if (indexes.rows.length > 0) {
    await sql`ALTER TABLE ws_village_estimation_details DROP INDEX village_id`.execute(
      db
    )
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Cek apakah index sudah ada
  const indexes = await sql<{ Key_name: string }>`
		SHOW INDEX FROM ws_village_estimation_details 
		WHERE Key_name = 'village_id'
	`.execute(db)

  // Hanya add jika index belum ada
  if (indexes.rows.length === 0) {
    await sql`ALTER TABLE ws_village_estimation_details ADD UNIQUE INDEX village_id (village_id)`.execute(
      db
    )
  }
}
