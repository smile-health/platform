import { Context } from "@smile-health/lib/types/context.js"
import { MaterialTargetsPaginatedRequestDTO } from "./material-targets.schema.js"
import { DB } from "@/common/infrastructure/database/types/db.js"

export class MaterialTargetsRepository {
  async getListMaterialTargets(
    c: Context<DB>,
    params: MaterialTargetsPaginatedRequestDTO
  ) {
    const { category, type } = params

    const baseQuery = c.var.trx
      .selectFrom("ws_material_targets as wmt")
      .where("wmt.deleted_at", "is", null)
      .$if(category != null, (qr) =>
        qr.where("wmt.category", "=", category as "bias" | "non_bias")
      )
      .$if(type != null, (qr) =>
        qr.where(
          "wmt.type",
          "=",
          type as "primary" | "additional" | "immunization"
        )
      )
      .leftJoin("ws_materials as wm", "wmt.material_id", "wm.id")
      .select([
        "wmt.id",
        "wmt.category",
        "wmt.type",
        "wmt.material_id",
        "wm.name",
      ])

    const [list, totalList] = await Promise.all([
      baseQuery.execute(),
      baseQuery.select((qb) => qb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return { list, total: Number(totalList?.total) || 0 }
  }

  async getMaterialTargetsByMaterialIds(
    c: Context<DB>,
    materialIds: number[],
    category: "bias" | "non_bias",
    type: "primary" | "additional"
  ) {
    if (materialIds.length === 0) return []

    return c.var.trx
      .selectFrom("ws_material_targets as wmt")
      .select(["wmt.id", "wmt.material_id", "wmt.category", "wmt.type"])
      .where("wmt.material_id", "in", materialIds)
      .where("wmt.category", "=", category)
      .where("wmt.type", "=", type)
      .where("wmt.deleted_at", "is", null)
      .execute()
  }

  async getMaterialTargetsPrimaryByMaterialIds(
    c: Context<DB>,
    materialIds: number[],
    category: "bias" | "non_bias",
  ) {
    return c.var.trx
      .selectFrom("ws_mp_material_target_config as wmmtc")
      .select(["wmmtc.id", "wmmtc.material_id", "wmmtc.category", "wmmtc.type"])
      .where("wmmtc.material_id", "in", materialIds)
      .where("wmmtc.category", "=", category)
      .where("wmmtc.deleted_at", "is", null)
      .execute()
  }

  async getMaterialTargetsByMaterialIdsAndMonth(
    c: Context<DB>,
    materialIds: number[],
    category: "bias" | "non_bias",
    type: "primary" | "additional",
    injectionMonth: string
  ) {
    if (materialIds.length === 0) return []

    return c.var.trx
      .selectFrom("ws_material_targets as wmt")
      .select([
        "wmt.id",
        "wmt.material_id",
        "wmt.category",
        "wmt.type",
        "wmt.injection_month",
      ])
      .where("wmt.material_id", "in", materialIds)
      .where("wmt.category", "=", category)
      .where("wmt.type", "=", type)
      .where("wmt.injection_month", "=", injectionMonth)
      .where("wmt.deleted_at", "is", null)
      .execute()
  }

  async getMpMaterialTargetsByMaterialIdsAndMonth(
    c: Context<DB>,
    materialIds: number[],
    category: "bias" | "non_bias",
    injectionMonth: string
  ) {
    const monthDistribution = injectionMonth === "august" ? 8 : 11

    return c.var.trx
      .selectFrom("ws_mp_material_target_config")
      .select([
        "id",
        "material_id",
        "category",
        "month_distribution",
      ])
      .where("material_id", "in", materialIds)
      .where("category", "=", category)
      .where("month_distribution", "=", monthDistribution)
      .where("deleted_at", "is", null)
      .execute()
  }
}
