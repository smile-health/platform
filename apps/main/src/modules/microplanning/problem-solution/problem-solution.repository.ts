import { Context } from "hono"
import { sql } from "kysely"

export interface FindVillagesWithSolutionsOptions {
  villageId?: number
  keyword?: string
}

export interface FindVillagesWithSolutionCountsOptions {
  villageId?: number
}

export interface FindSolutionsByVillageOptions {
  problemCategoryId?: number
}

export interface ProblemTypeConfig {
  id: number
  name: string
}

export interface ProblemCategoryConfig {
  id: number
  problem_type_id: number | null
  name: string
  is_custom: number
  is_solution_required?: number
}

export interface VillageSolutionCountResult {
  village_id: number
  village_name: string
  problem_type_id: number | null
  problem_type_name: string | null
  count: number | null
}

export interface VillageSolutionDetailResult {
  id: number
  problem_type_id: number
  problem_type_name: string
  problem_category_id: number | null
  problem_category_name: string | null
  solution: string
  status: number
}

export class ProblemSolutionRepository {
  async findVillagesWithSolutions(
    c: Context,
    microplanningId: number,
    options?: FindVillagesWithSolutionsOptions
  ) {
    const { villageId, keyword } = options ?? {}

    let query = c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as l", "l.id", "mv.village_id")
      .leftJoin("ws_microplanning_problem_solutions as ps", (join) =>
        join
          .onRef("ps.village_id", "=", "mv.village_id")
          .onRef("ps.microplanning_id", "=", "mv.microplanning_id")
          .on("ps.deleted_at", "is", null)
      )
      .select([
        "mv.village_id",
        sql<string>`CONCAT('DESA ', l.name)`.as("village_name"),
        "ps.id",
        "ps.problem_type_id",
        "ps.problem_category_id",
        "ps.solution",
        "ps.status",
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .orderBy("mv.village_id", "asc")
      .orderBy("ps.id", "asc")

    if (villageId) {
      query = query.where("mv.village_id", "=", villageId)
    }

    if (keyword) {
      query = query.where("l.name", "like", `%${keyword}%`)
    }

    return query.execute()
  }

  async findVillagesWithSolutionCounts(
    c: Context,
    microplanningId: number,
    options?: FindVillagesWithSolutionCountsOptions
  ): Promise<VillageSolutionCountResult[]> {
    const { villageId, keyword } = options ?? {}

    let query = c.var.trx
      .selectFrom("ws_microplanning_villages as mv")
      .innerJoin("locations as l", "l.id", "mv.village_id")
      .leftJoin("ws_microplanning_problem_solutions as ps", (join) =>
        join
          .onRef("ps.village_id", "=", "mv.village_id")
          .onRef("ps.microplanning_id", "=", "mv.microplanning_id")
          .on("ps.deleted_at", "is", null)
      )
      .select([
        "mv.village_id",
        sql<string>`CONCAT('DESA ', l.name)`.as("village_name"),
        "ps.problem_type_id",
        sql<number>`COUNT(ps.id)`.as("count"),
      ])
      .where("mv.microplanning_id", "=", microplanningId)
      .where("mv.is_assigned", "=", 1)
      .groupBy(["mv.village_id", "l.name", "ps.problem_type_id"])
      .orderBy("mv.village_id", "asc")

    if (villageId) {
      query = query.where("mv.village_id", "=", villageId)
    }

    if (keyword) {
      query = query.where("l.name", "like", `%${keyword}%`)
    }

    return query.execute() as Promise<VillageSolutionCountResult[]>
  }

  async getProblemTypesConfig(c: Context): Promise<ProblemTypeConfig[]> {
    const programId = c.var.programId
    const result = await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "problem_types")
      .where("program_id", "=", programId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.config
      ? (result.config as unknown as ProblemTypeConfig[])
      : []
  }

  async getProblemCategoriesConfig(
    c: Context
  ): Promise<ProblemCategoryConfig[]> {
    const programId = c.var.programId
    const result = await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "problem_categories")
      .where("program_id", "=", programId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return result?.config
      ? (result.config as unknown as ProblemCategoryConfig[])
      : []
  }

  async create(
    c: Context,
    data: {
      microplanning_id: number
      village_id: number
      problem_type_id: number
      problem_category_id: number | null
      problem_category_name: string | null
      solution: string | null
    }
  ) {
    return c.var.trx
      .insertInto("ws_microplanning_problem_solutions")
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
      problem_category_id?: number | null
      problem_category_name?: string | null
      solution: string | null
    }
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_problem_solutions")
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

  async findById(c: Context, id: number) {
    return c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async findByIdsAndMicroplanning(
    c: Context,
    ids: number[],
    microplanningId: number
  ) {
    if (ids.length === 0) return []
    return c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .select([
        "id",
        "village_id",
        "problem_type_id",
        "problem_category_id",
        "problem_category_name",
      ])
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
      .selectFrom("ws_microplanning_problem_solutions")
      .select(c.var.trx.fn.countAll<number>().as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
    return Number(result?.count ?? 0)
  }

  async countProblemTypesPerVillage(
    c: Context,
    microplanningId: number,
    villageId: number
  ) {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .select((eb) =>
        eb.fn.countDistinct("problem_type_id").as("problem_type_count")
      )
      .where("microplanning_id", "=", microplanningId)
      .where("village_id", "=", villageId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return Number(result?.problem_type_count ?? 0)
  }

  async findSolutionsByVillage(
    c: Context,
    microplanningId: number,
    villageId: number,
    options?: FindSolutionsByVillageOptions
  ): Promise<VillageSolutionDetailResult[]> {
    const { problemCategoryId } = options ?? {}

    let query = c.var.trx
      .selectFrom("ws_microplanning_problem_solutions as ps")
      .select([
        "ps.id",
        "ps.problem_type_id",
        "ps.problem_category_id",
        "ps.problem_category_name",
        "ps.solution",
        "ps.status",
      ])
      .where("ps.microplanning_id", "=", microplanningId)
      .where("ps.village_id", "=", villageId)
      .where("ps.deleted_at", "is", null)

    if (problemCategoryId) {
      query = query.where("ps.problem_category_id", "=", problemCategoryId)
    }

    return query.execute() as Promise<VillageSolutionDetailResult[]>
  }

  async delete(c: Context, id: number) {
    return c.var.trx
      .updateTable("ws_microplanning_problem_solutions")
      .set({
        deleted_at: new Date(),
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .execute()
  }

  async countSolutionsByProblemType(
    c: Context,
    microplanningId: number
  ): Promise<{ problem_type_id: number; count: number }[]> {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_problem_solutions")
      .select(["problem_type_id"])
      .select((eb) => eb.fn.count<number>("id").as("count"))
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .groupBy("problem_type_id")
      .execute()

    return result.map((r) => ({
      problem_type_id: r.problem_type_id,
      count: Number(r.count ?? 0),
    }))
  }
}
