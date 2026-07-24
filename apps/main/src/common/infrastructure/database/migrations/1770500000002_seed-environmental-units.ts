import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  const units = [
    { name: "°C" },
    { name: "mg/L" },
    { name: "NTU" },
    { name: "TCU" },
    { name: "-" },
  ]

  await db.insertInto("environmental_units" as any).values(units).execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`TRUNCATE TABLE environmental_units`.execute(db)
}

