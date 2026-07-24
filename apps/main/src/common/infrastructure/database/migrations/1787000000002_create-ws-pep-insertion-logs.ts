import { Kysely, sql } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await sql`
    CREATE TABLE ws_pep_insertion_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      inserted_by INT NOT NULL,
      insertion_consumption_id INT NOT NULL,
      pre_shift_state JSON NOT NULL,
      inserted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_pep_insertion_logs").execute()
}
