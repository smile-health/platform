import { Context } from "hono"
import { sql } from "kysely"

export class MpConfigRepository {
  async getActiveMpProgramConfigId(
    c: Context,
    year: number,
    category: "non_bias" | "bias"
  ): Promise<number | null> {
    const row = await c.var.trx
      .selectFrom("ws_mp_program_config")
      .select("id")
      .where("year", "=", year)
      .where("category", "=", category)
      .where("status", "=", 1)
      .where("deleted_at", "is", null)
      .orderBy("id", "asc")
      .executeTakeFirst()

    return row ? Number(row.id) : null
  }

  async getActiveProgramConfigIds(c: Context, year: number): Promise<number[]> {
    const rows = await c.var.trx
      .selectFrom("ws_mp_program_config")
      .select("id")
      .where("status", "=", 1)
      .where("year", "=", year)
      .where("deleted_at", "is", null)
      .execute()

    return rows.map((r) => Number(r.id))
  }

  async getActiveProgramConfigIdsForYears(
    c: Context,
    years: number[]
  ): Promise<number[]> {
    if (years.length === 0) return []
    const rows = await c.var.trx
      .selectFrom("ws_mp_program_config")
      .select("id")
      .where("status", "=", 1)
      .where("year", "in", years)
      .where("deleted_at", "is", null)
      .execute()
    return rows.map((r) => Number(r.id))
  }

  async getMpMaterialsForCategory(
    c: Context,
    mpProgramConfigId: number,
    provinceId: number
  ): Promise<
    {
      material_id: number
      name: string
      parent_id: number | null
      effective_ip: number | null
      number_of_dose: number | null
    }[]
  > {
    if (!provinceId) return []

    return c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin("ws_materials as wm", "wm.id", "mc.material_id")
      .leftJoin("ws_mp_province_coverage as cov", (join) =>
        join
          .onRef("cov.mp_material_target_config_id", "=", "mc.id")
          .on("cov.province_id", "=", provinceId)
          .on("cov.deleted_at", "is", null)
      )
      .select([
        "mc.material_id",
        "wm.name",
        "wm.parent_id",
        sql<number>`MIN(COALESCE(cov.coverage_number, mc.ip))`.as(
          "effective_ip"
        ),
        sql<number | null>`MAX(mc.number_of_dose)`.as("number_of_dose"),
      ])
      .where("mc.mp_program_config_id", "=", mpProgramConfigId)
      .where("mc.type", "=", "immunization")
      .where("mc.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          // Nasional: tidak ada coverage row untuk material ini
          eb.not(
            eb.exists(
              eb
                .selectFrom("ws_mp_province_coverage as cov2")
                .select("cov2.id")
                .where(
                  "cov2.mp_material_target_config_id",
                  "=",
                  eb.ref("mc.id")
                )
                .where("cov2.deleted_at", "is", null)
            )
          ),
          // Atau: ada coverage row untuk provinsi yang dicari
          eb.exists(
            eb
              .selectFrom("ws_mp_province_coverage as cov2")
              .select("cov2.id")
              .where("cov2.mp_material_target_config_id", "=", eb.ref("mc.id"))
              .where("cov2.province_id", "=", provinceId)
              .where("cov2.deleted_at", "is", null)
          ),
        ])
      )
      .groupBy(["mc.material_id", "wm.name", "wm.parent_id"])
      .orderBy("mc.start_ideal_days", "asc")
      .execute()
      .then((rows) =>
        rows.map((r) => ({
          ...r,
          parent_id: r.parent_id != null ? Number(r.parent_id) : null,
        }))
      )
  }

  async getMpMaterialsForCategories(
    c: Context,
    mpProgramConfigIds: number[],
    provinceId: number
  ): Promise<
    {
      id: number
      material_id: number
      name: string
      parent_id: number | null
      start_ideal_days: number | null
      effective_ip: number | null
      number_of_dose: number | null
    }[]
  > {
    if (!provinceId || mpProgramConfigIds.length === 0) return []

    return c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin("ws_materials as wm", "wm.id", "mc.material_id")
      .leftJoin("ws_mp_province_coverage as cov", (join) =>
        join
          .onRef("cov.mp_material_target_config_id", "=", "mc.id")
          .on("cov.province_id", "=", provinceId)
          .on("cov.deleted_at", "is", null)
      )
      .select([
        "mc.id",
        "mc.material_id",
        "mc.start_ideal_days",
        "wm.name",
        "wm.parent_id",
        sql<number>`MIN(COALESCE(cov.coverage_number, mc.ip))`.as(
          "effective_ip"
        ),
        sql<number | null>`MAX(mc.number_of_dose)`.as("number_of_dose"),
      ])
      .where("mc.mp_program_config_id", "in", mpProgramConfigIds)
      .where("mc.type", "=", "immunization")
      .where("mc.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          eb.not(
            eb.exists(
              eb
                .selectFrom("ws_mp_province_coverage as cov2")
                .select("cov2.id")
                .where(
                  "cov2.mp_material_target_config_id",
                  "=",
                  eb.ref("mc.id")
                )
                .where("cov2.deleted_at", "is", null)
            )
          ),
          eb.exists(
            eb
              .selectFrom("ws_mp_province_coverage as cov2")
              .select("cov2.id")
              .where("cov2.mp_material_target_config_id", "=", eb.ref("mc.id"))
              .where("cov2.province_id", "=", provinceId)
              .where("cov2.deleted_at", "is", null)
          ),
        ])
      )
      .groupBy(["mc.id", "mc.material_id", "mc.start_ideal_days", "wm.name", "wm.parent_id"])
      .orderBy("mc.start_ideal_days", "asc")
      .execute()
      .then((rows) =>
        rows.map((r) => ({
          ...r,
          id: Number(r.id),
          parent_id: r.parent_id != null ? Number(r.parent_id) : null,
        }))
      )
  }

  async getMaterialKeyMap(
    c: Context,
    mpProgramConfigId: number
  ): Promise<Map<string, number>> {
    const rows = await c.var.trx
      .selectFrom("ws_mp_material_target_config")
      .select(["material_key", "material_id"])
      .where("mp_program_config_id", "=", mpProgramConfigId)
      .where("material_key", "is not", null)
      .where("deleted_at", "is", null)
      .groupBy(["material_key", "material_id"])
      .execute()

    return new Map(
      rows
        .filter(
          (r): r is typeof r & { material_key: string } =>
            r.material_key !== null
        )
        .map((r) => [r.material_key, r.material_id])
    )
  }

  async getMpMaterialSubstitutions(
    c: Context,
    year: number,
    category: "non_bias" | "bias",
    materialId: number
  ): Promise<{ substitution_material_id: number; priority: number }[]> {
    return c.var.trx
      .selectFrom("ws_mp_material_substitution as s")
      .innerJoin(
        "ws_mp_program_config as pc",
        "pc.id",
        "s.mp_program_config_id"
      )
      .select(["s.substitution_material_id", "s.priority"])
      .where("s.material_id", "=", materialId)
      .where("pc.year", "=", year)
      .where("pc.category", "=", category)
      .where("pc.status", "=", 1)
      .where("pc.deleted_at", "is", null)
      .where("s.deleted_at", "is", null)
      .orderBy("s.priority", "asc")
      .execute()
      .then((rows) =>
        rows.map((r) => ({
          substitution_material_id: r.substitution_material_id,
          priority: r.priority,
        }))
      )
  }
}
