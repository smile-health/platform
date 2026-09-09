import type { Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function seed(db: Kysely<Database>): Promise<void> {
  const tableName = "budget_sources"

  const budgetSources = [
    { id: 1, name: "APBN", description: null, created_by: null, updated_by: 6496, is_restricted: 1, is_custom: 0 },
    { id: 2, name: "APBD-I", description: null, created_by: null, updated_by: 134, is_restricted: 0, is_custom: 0 },
    { id: 3, name: "APBD-II", description: null, created_by: null, updated_by: 134, is_restricted: 0, is_custom: 0 },
    { id: 4, name: "DAK", description: null, created_by: null, updated_by: 6496, is_restricted: 0, is_custom: 0 },
    { id: 13, name: "JKN", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 14, name: "HIBAH", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 16, name: "DAU", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 17, name: "DAU-SG", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 19, name: "Kapitasi", description: null, created_by: null, updated_by: 821, is_restricted: 0, is_custom: 0 },
    { id: 20, name: "HIBAH - GLOBAL FUND", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 21, name: "HIBAH - USAID", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 22, name: "HIBAH - UEA (UNI EMIRAT ARAB)", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 23, name: "Non Kapitasi", description: null, created_by: null, updated_by: 6496, is_restricted: 0, is_custom: 0 },
    { id: 24, name: "Global Fund", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 0 },
    { id: 26, name: "Hibah - YKI", description: null, created_by: 821, updated_by: 821, is_restricted: 0, is_custom: 0 },
    { id: 27, name: "Hibah - TB Reach", description: null, created_by: 821, updated_by: 821, is_restricted: 0, is_custom: 0 },
    { id: 28, name: "Hibah - TB Care", description: null, created_by: 821, updated_by: 821, is_restricted: 0, is_custom: 0 },
    { id: 29, name: "Badan Nasional Penanggulangan Bencana", description: null, created_by: 821, updated_by: 821, is_restricted: 0, is_custom: 0 },
    { id: 30, name: "Anggaran Operational Rumah Sakit", description: null, created_by: 6496, updated_by: 6496, is_restricted: 0, is_custom: 0 },
    { id: 40, name: "Lainnya", description: null, created_by: null, updated_by: null, is_restricted: 0, is_custom: 1 },
  ]

  for (const source of budgetSources) {
    await db
      .insertInto(tableName)
      .values(source)
      .onDuplicateKeyUpdate({
        name: source.name,
        description: source.description,
        created_by: source.created_by,
        updated_by: source.updated_by,
        is_restricted: source.is_restricted,
        is_custom: source.is_custom,
      })
      .execute()
  }

  console.log("Budget sources seeded.")
}
