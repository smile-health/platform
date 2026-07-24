import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const groups = [
    { title: "Pre-Exposure" },
    { title: "Post-Exposure" },
    { title: "Booster" },
  ]

  // Get all existing data
  const existingRecords = await db
    .selectFrom("vaccine_types")
    .select(["title"])
    .where(
      "title",
      "in",
      groups.map((g) => g.title)
    )
    .execute()

  const filteredVaccineType = groups.filter(
    (m) => !existingRecords.some((r) => r.title === m.title)
  )

  if (filteredVaccineType.length > 0)
    await db.insertInto("vaccine_types").values(filteredVaccineType).execute()
}
