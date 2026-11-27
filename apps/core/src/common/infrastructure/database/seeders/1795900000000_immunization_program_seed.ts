import type { Kysely } from "kysely"
import { seedImmunizationProgram } from "../seed-data/immunization-program/seed.js"
import { Database } from "../types/index.js"

/**
 * Program Imunisasi (workspace key "immunization") with master data from SMILE
 * production onprem (Kemenkes + top 10 provinsi/kab-kota/puskesmas/lastmile) and
 * 12 months of generated orders, stocks and transactions. See
 * seed-data/immunization-program/README.md.
 *
 * Run only this seed: `bunx kysely seed:run --specific 1795900000000_immunization_program_seed`
 */
export async function seed(db: Kysely<Database>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await seedImmunizationProgram(db as unknown as Kysely<any>)
}
