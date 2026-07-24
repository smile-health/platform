/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely"

// Seed dari ws_material_substitutions → ws_mp_material_substitution.
// Jalankan migration ini setelah ws_material_substitutions memiliki data
// (data diisi melalui fitur annual planning).
// Jika ws_material_substitutions masih kosong, migration ini tidak melakukan apa-apa.

export async function up(db: Kysely<any>): Promise<void> {
  // JOIN langsung ke ws_mp_program_config tanpa filter kategori:
  // satu plan memiliki 2 rows di ws_mp_program_config (non_bias + bias),
  // sehingga JOIN otomatis menghasilkan kedua kategori — menggantikan inner loop per kategori.
  const rows = await db
    .selectFrom("ws_material_substitutions as s")
    .innerJoin("ws_program_plans as pp", "pp.id", "s.program_plan_id")
    .innerJoin("ws_mp_program_config as pc", (join) =>
      join
        .onRef("pc.seeded_from_plan_id", "=", "s.program_plan_id")
        .on("pc.deleted_at", "is", null)
    )
    .select([
      "s.id as source_ref_id",
      "s.material_id",
      "s.substitution_material_id",
      "pc.id as mp_program_config_id",
    ])
    .where("pp.is_active", "=", 1)
    .where("s.deleted_at", "is", null)
    .execute()

  for (const row of rows) {
    await db
      .insertInto("ws_mp_material_substitution")
      .values({
        mp_program_config_id: row.mp_program_config_id,
        material_id: row.material_id,
        substitution_material_id: row.substitution_material_id,
        priority: 1,
        source_ref_id: row.source_ref_id,
      })
      .ignore()
      .execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom("ws_mp_material_substitution").execute()
}
