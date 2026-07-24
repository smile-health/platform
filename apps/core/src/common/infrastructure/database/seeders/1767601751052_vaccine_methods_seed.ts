import { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const groups = [
    { title: "Inter Muscular", is_multi_patient: 0 },
    { title: "Inter Dermal", is_multi_patient: 1 },
    { title: "Dengue", is_multi_patient: 1 },
  ]

  // Get all existing data
  const existingRecords = await db
    .selectFrom("vaccine_methods")
    .select(["title"])
    .where(
      "title",
      "in",
      groups.map((g) => g.title)
    )
    .execute()

  const filteredVaccineMethod = groups.filter(
    (m) => !existingRecords.some((r) => r.title === m.title)
  )

  if (filteredVaccineMethod.length > 0)
    await db
      .insertInto("vaccine_methods")
      .values(filteredVaccineMethod)
      .execute()
}
