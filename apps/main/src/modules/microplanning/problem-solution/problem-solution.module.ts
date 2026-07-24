import { Context } from "hono"
import { ProblemSolutionRepository } from "./problem-solution.repository.js"
import {
  CreateProblemSolution,
  ProblemCategorySolution,
  ProblemSolutionSummaryResponse,
  ProblemTypeWithSolutions,
  UpdateProblemSolution,
  UpdateSolutionResponse,
  VillageSolutionCountResponse,
  VillageSolutionsDetailResponse,
} from "./problem-solution.schema.js"

export class ProblemSolutionModule {
  constructor(private readonly repository: ProblemSolutionRepository) {}

  async getSummary(c: Context): Promise<ProblemSolutionSummaryResponse> {
    const microplanningId = c.var.microplanningId!
    const problemTypes = await this.repository.getProblemTypesConfig(c)
    const problemTypeCounts = await this.repository.countSolutionsByProblemType(
      c,
      microplanningId
    )

    // Get villages count
    const villages = await this.repository.findVillagesWithSolutionCounts(
      c,
      microplanningId
    )

    // Count unique villages
    const uniqueVillages = new Set(villages.map((v) => v.village_id))
    const totalVillages = uniqueVillages.size

    // Count completed villages (villages with exactly 2 problem_types filled)
    const villageProblemTypeCounts = new Map<number, number>()
    for (const v of villages) {
      if (v.problem_type_id !== null) {
        const count = villageProblemTypeCounts.get(v.village_id) ?? 0
        villageProblemTypeCounts.set(v.village_id, count + 1)
      }
    }
    const completedVillages = Array.from(
      villageProblemTypeCounts.values()
    ).filter((count) => count === 2).length

    // Build problem type summary with translations
    const { t } = c.var
    const problemTypeSummary = problemTypes.map((pt) => {
      const countData = problemTypeCounts.find(
        (c) => c.problem_type_id === pt.id
      )
      return {
        problem_type_id: pt.id,
        problem_type_name: t(`problem_types.label.${pt.name}`),
        count: countData?.count ?? 0,
      }
    })

    return {
      problem_type_summary: problemTypeSummary,
      progress: {
        completed_villages: completedVillages,
        total_villages: totalVillages,
      },
    }
  }

  async getVillagesWithCounts(
    c: Context,
    villageId?: number,
    keyword?: string
  ): Promise<VillageSolutionCountResponse[]> {
    const microplanningId = c.var.microplanningId!
    const problemTypes = await this.repository.getProblemTypesConfig(c)

    // Define the two expected problem types
    const expectedProblemTypeIds = [1, 2]

    const countsData = await this.repository.findVillagesWithSolutionCounts(
      c,
      microplanningId,
      { villageId, keyword }
    )

    // Group by village
    const villageMap = new Map<
      number,
      {
        village_id: number
        village_name: string
        problem_types: Map<number, { problem_type_id: number; count: number }>
      }
    >()

    for (const row of countsData) {
      let existing = villageMap.get(row.village_id)
      if (!existing) {
        existing = {
          village_id: row.village_id,
          village_name: row.village_name,
          problem_types: new Map(),
        }
        villageMap.set(row.village_id, existing)
      }

      if (row.problem_type_id !== null) {
        const pt = existing.problem_types.get(row.problem_type_id)
        if (pt) {
          pt.count += Number(row.count ?? 0)
        } else {
          existing.problem_types.set(row.problem_type_id, {
            problem_type_id: row.problem_type_id,
            count: Number(row.count ?? 0),
          })
        }
      }
    }

    // Build response
    const { t } = c.var
    const result: VillageSolutionCountResponse[] = Array.from(
      villageMap.values()
    ).map((village) => {
      // Always include both problem types, even if count is 0
      const problemTypesArray = expectedProblemTypeIds.map((ptId) => {
        const existing = village.problem_types.get(ptId)
        const count = existing?.count ?? 0
        const problemType = problemTypes.find((p) => p.id === ptId)
        return {
          problem_type_id: ptId,
          problem_type_name: problemType
            ? t(`problem_types.label.${problemType.name}`)
            : "",
          count,
        }
      })

      // A village is considered completed only if both problem types have at least one solution
      const hasCompleted = problemTypesArray.every((pt) => pt.count > 0) ? 1 : 0

      return {
        village_id: village.village_id,
        village_name: village.village_name,
        has_completed: hasCompleted,
        data: { problem_types: problemTypesArray },
      }
    })

    return result
  }

  async getVillageSolutionsDetail(
    c: Context,
    villageId: number,
    problemTypeId?: number
  ): Promise<VillageSolutionsDetailResponse> {
    const microplanningId = c.var.microplanningId!
    const problemTypes = await this.repository.getProblemTypesConfig(c)
    const problemCategories =
      await this.repository.getProblemCategoriesConfig(c)

    // Get village name
    const villages = await this.repository.findVillagesWithSolutions(
      c,
      microplanningId,
      {
        villageId,
      }
    )

    if (villages.length === 0) {
      throw new Error("Village not found")
    }

    const villageName = villages[0].village_name

    const solutionsData = await this.repository.findSolutionsByVillage(
      c,
      microplanningId,
      villageId
    )

    // Group solutions by problem_type
    const problemTypeMap = new Map<
      number,
      {
        problem_type_id: number
        problem_type_name: string
        solutions: ProblemCategorySolution[]
      }
    >()

    const { t } = c.var

    // Seed all problem types so they always appear even with 0 solutions
    const visibleProblemTypes = problemTypeId !== undefined
      ? problemTypes.filter((pt) => pt.id === problemTypeId)
      : problemTypes
    for (const pt of visibleProblemTypes) {
      problemTypeMap.set(pt.id, {
        problem_type_id: pt.id,
        problem_type_name: t(`problem_types.label.${pt.name}`),
        solutions: [],
      })
    }

    for (const s of solutionsData) {
      // Filter by problem_type_id if provided
      if (problemTypeId !== undefined && s.problem_type_id !== problemTypeId) {
        continue
      }

      const problemType = problemTypes.find((pt) => pt.id === s.problem_type_id)
      const problemCategory = problemCategories.find(
        (pc) => pc.id === s.problem_category_id
      )

      if (!problemTypeMap.has(s.problem_type_id)) {
        problemTypeMap.set(s.problem_type_id, {
          problem_type_id: s.problem_type_id,
          problem_type_name: problemType
            ? t(`problem_types.label.${problemType.name}`)
            : "",
          solutions: [],
        })
      }

      problemTypeMap.get(s.problem_type_id)!.solutions.push({
        id: s.id,
        problem_category_id: s.problem_category_id,
        problem_category_name:
          s.problem_category_name ??
          (problemCategory
            ? t(`problem_categories.label.${problemCategory.name}`)
            : ""),
        is_custom: problemCategory.is_custom,
        solution: s.solution,
      })
    }

    const problem_types: ProblemTypeWithSolutions[] = Array.from(
      problemTypeMap.values()
    )

    return {
      village_id: villageId,
      village_name: villageName,
      problem_types,
    }
  }

  async create(c: Context, item: CreateProblemSolution) {
    const microplanningId = c.var.microplanningId!

    const dbData = {
      microplanning_id: microplanningId,
      village_id: item.village_id,
      problem_type_id: item.problem_type_id,
      problem_category_id: item.problem_category_id ?? null,
      problem_category_name: item.problem_category_name ?? null,
      solution: item.solution ?? null,
    }

    try {
      await this.repository.create(c, dbData)
      return { message: "success" }
    } catch (error: unknown) {
      const err = error as { code: string }
      if (err?.code === "ER_DUP_ENTRY") {
        throw new Error("Duplicate entry")
      }
      throw error
    }
  }

  async update(c: Context, id: number, item: UpdateProblemSolution) {
    const dbData = {
      problem_category_id: item.problem_category_id ?? null,
      problem_category_name: item.problem_category_name ?? null,
      solution: item.solution ?? null,
    }

    await this.repository.update(c, id, dbData)
    return { message: "success" } as UpdateSolutionResponse
  }

  async delete(c: Context, id: number): Promise<UpdateSolutionResponse> {
    await this.repository.delete(c, id)
    return { message: "success" }
  }
}
