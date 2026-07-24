import FormulaParser from "fparser"
import { Context } from "hono"
import { sql } from "kysely"
import { CalculatedFields } from "./priority-areas.schema.js"

export interface FindPriorityAreasOptions {
  villageId?: number
  hasCompletedOnly?: boolean
  orderBy?: "priority_rank" | "id"
}

export interface PriorityAreaWithCalculated {
  village_id: number
  village_name: string
  id: number | null
  target_newborn_baby: number | null
  target_surviving_infants: number | null
  achievement_bcg: number | null
  achievement_dpt1: number | null
  achievement_dpt3: number | null
  achievement_mr1: number | null
  achievement_mr2: number | null
  achievement_dpt4: number | null
  achievement_prev_dpt3: number | null
  achievement_prev_mr1: number | null
  has_supporting_condition: number | null
  has_pd3i_case: number | null
  priority_rank: number | null
  status: number | null
  calculated: CalculatedFields | null
}

export class PriorityAreasRepository {
  #evaluateFormulas(
    area: Record<string, unknown>,
    formulas: Record<string, string>
  ): CalculatedFields {
    const calculated: Record<string, unknown> = {}
    const variables: Record<string, unknown> = {
      ...area,
      has_supporting_condition: area.has_supporting_condition ? 1 : 0,
    }

    for (const [key, expression] of Object.entries(formulas)) {
      try {
        const fObj = new FormulaParser(expression)
        const result = fObj.evaluate(variables)
        calculated[key] = result
        variables[key] = result
      } catch (e) {
        console.error(`Error evaluating formula ${key}:`, e)
        calculated[key] = null
      }
    }

    return {
      lo_raw: calculated.lo_raw ?? null,
      lo_rate: calculated.lo_rate ?? null,
      do_bayi_dpt13_raw: calculated.do_bayi_dpt13_raw ?? null,
      do_bayi_dpt13_rate: calculated.do_bayi_dpt13_rate ?? null,
      do_bayi_dpt1cr1_raw: calculated.do_bayi_dpt1cr1_raw ?? null,
      do_bayi_dpt1cr1_rate: calculated.do_bayi_dpt1cr1_rate ?? null,
      do_baduta_dpt34_raw: calculated.do_baduta_dpt34_raw ?? null,
      do_baduta_dpt34_rate: calculated.do_baduta_dpt34_rate ?? null,
      do_baduta_cr12_raw: calculated.do_baduta_cr12_raw ?? null,
      do_baduta_cr12_rate: calculated.do_baduta_cr12_rate ?? null,
      criteria_lo: calculated.criteria_lo ?? null,
      criteria_do: calculated.criteria_do ?? null,
      category: calculated.category ?? null,
      risk: calculated.risk ?? null,
    } as CalculatedFields
  }

  async findPriorityAreas(
    c: Context,
    microplanningId: number,
    options?: FindPriorityAreasOptions
  ): Promise<PriorityAreaWithCalculated[]> {
    const { villageId, hasCompletedOnly, orderBy } = options ?? {}

    const [areas, formulaConfigRaw] = await Promise.all([
      this.#fetchPriorityAreas(c, microplanningId, {
        villageId,
        hasCompletedOnly,
        orderBy,
      }),
      this.getFormulaConfig(c),
    ])

    const formulas: Record<string, string> = formulaConfigRaw?.config
      ? (formulaConfigRaw.config as unknown as Record<string, string>)
      : {}

    return areas.map((area) => {
      const calculated = area.id
        ? this.#evaluateFormulas(area as Record<string, unknown>, formulas)
        : null

      return {
        ...area,
        calculated,
      }
    })
  }

  async #fetchPriorityAreas(
    c: Context,
    microplanningId: number,
    options: {
      villageId?: number
      hasCompletedOnly?: boolean
      orderBy?: "priority_rank" | "id"
    }
  ) {
    const { villageId, hasCompletedOnly, orderBy } = options

    let query = c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as l", "l.id", "mv.village_id")
      .leftJoin("ws_microplanning_priority_areas as pa", (join) =>
        join
          .onRef("pa.village_id", "=", "mv.village_id")
          .onRef("pa.microplanning_id", "=", "mv.microplanning_id")
          .on("pa.deleted_at", "is", null)
      )
      .select([
        "mv.village_id",
        sql<string>`CONCAT('DESA ', l.name)`.as("village_name"),
        "pa.id",
        "pa.target_bayi_lahir as target_newborn_baby",
        "pa.target_surviving_infants",
        "pa.achievement_bcg",
        "pa.achievement_dpt1",
        "pa.achievement_dpt3",
        "pa.achievement_mr1",
        "pa.achievement_mr2",
        "pa.achievement_dpt4",
        "pa.achievement_prev_dpt3",
        "pa.achievement_prev_mr1",
        "pa.has_supporting_condition",
        "pa.has_pd3i_case",
        "pa.priority_rank",
        "pa.status",
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .groupBy(["mv.village_id", "pa.id"])

    if (villageId) {
      query = query.where("mv.village_id", "=", villageId)
    }

    if (hasCompletedOnly) {
      query = query.where("pa.id", "is not", null)
    }

    if (orderBy === "priority_rank") {
      query = query.orderBy("pa.priority_rank", "asc")
    } else if (orderBy === "id") {
      query = query.orderBy("pa.id", "asc")
    }

    return query.execute()
  }

  async getFormulaConfig(c: Context) {
    const programId = c.var.programId
    return c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "priority_area_formulas")
      .where("program_id", "=", programId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getMicroplanningByEntityAndYear(
    c: Context,
    entityId: number,
    year: number
  ) {
    return c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "status"])
      .where("entity_id", "=", entityId)
      .where("year", "=", year)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_priority_areas")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async create(
    c: Context,
    data: {
      microplanning_id: number
      village_id: number
      target_bayi_lahir: number | null | undefined
      target_surviving_infants: number | null | undefined
      achievement_bcg: number | null | undefined
      achievement_dpt1: number | null | undefined
      achievement_dpt3: number | null | undefined
      achievement_mr1: number | null | undefined
      achievement_mr2: number | null | undefined
      achievement_dpt4: number | null | undefined
      achievement_prev_dpt3: number | null | undefined
      achievement_prev_mr1: number | null | undefined
      has_supporting_condition: number | null | undefined
      has_pd3i_case: number | null | undefined
    }
  ) {
    return c.var.trx
      .insertInto("ws_microplanning_priority_areas")
      .values({
        ...data,
        status: 0,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .onDuplicateKeyUpdate({
        ...data,
        status: 0,
        deleted_at: null,
      })
      .executeTakeFirst()
  }

  async update(
    c: Context,
    id: number,
    data: {
      target_bayi_lahir?: number | null
      target_surviving_infants?: number | null
      achievement_bcg?: number | null
      achievement_dpt1?: number | null
      achievement_dpt3?: number | null
      achievement_mr1?: number | null
      achievement_mr2?: number | null
      achievement_dpt4?: number | null
      achievement_prev_dpt3?: number | null
      achievement_prev_mr1?: number | null
      has_supporting_condition?: number | null
      has_pd3i_case?: number | null
    }
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_priority_areas")
      .set({
        ...data,
        status: 0,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async resetRankings(c: Context) {
    return c.var.trx
      .updateTable("ws_microplanning_priority_areas")
      .set({
        priority_rank: null,
        status: 0,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("microplanning_id", "=", c.var.microplanningId!)
      .execute()
  }

  async updateRanking(c: Context, id: number, priorityRank: number) {
    return c.var.trx
      .updateTable("ws_microplanning_priority_areas")
      .set({
        priority_rank: priorityRank,
        status: 0,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async findByIdsAndMicroplanning(
    c: Context,
    ids: number[],
    microplanningId: number
  ) {
    if (ids.length === 0) return []
    return c.var.trx
      .selectFrom("ws_microplanning_priority_areas")
      .select(["id", "village_id"])
      .where("id", "in", ids)
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async findAssignedVillageIds(
    c: Context,
    microplanningId: number,
    villageIds: number[]
  ) {
    if (villageIds.length === 0) return []
    return c.var.trx
      .selectFrom("ws_microplanning_villages")
      .select("village_id")
      .where("microplanning_id", "=", microplanningId)
      .where("is_assigned", "=", 1)
      .where("village_id", "in", villageIds)
      .execute()
  }

  async countByMicroplanningId(c: Context, microplanningId: number) {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_priority_areas")
      .select(c.var.trx.fn.countAll<number>().as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return Number(result?.count ?? 0)
  }

  async countAssignedVillages(c: Context, microplanningId: number) {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_villages")
      .select(c.var.trx.fn.countAll<number>().as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("is_assigned", "=", 1)
      .executeTakeFirst()
    return Number(result?.count ?? 0)
  }

  async countCompletedVillages(c: Context, microplanningId: number) {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_priority_areas")
      .select(c.var.trx.fn.countAll<number>().as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .where("id", "is not", null)
      .executeTakeFirst()
    return Number(result?.count ?? 0)
  }
}
