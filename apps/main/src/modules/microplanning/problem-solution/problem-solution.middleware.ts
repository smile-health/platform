import { Context } from "hono"
import {
  InvalidProblemCategoryId,
  InvalidProblemTypeId,
  InvalidVillageId,
  ProblemCategoryMismatch,
  ProblemSolutionNotFound,
  ProblemCategoryNameMissing,
  SolutionRequired,
  VillageNotInMicroplanning,
} from "./problem-solution.error.js"
import { ProblemSolutionRepository } from "./problem-solution.repository.js"
import {
  CreateProblemSolution,
  UpdateProblemSolution,
} from "./problem-solution.schema.js"

export class ProblemSolutionMiddleware {
  constructor(private readonly repository: ProblemSolutionRepository) {}

  validateCreate = async (c: Context, body: CreateProblemSolution) => {
    const microplanningId = c.var.microplanningId!

    // 1. Validate village_id exists in microplanning villages
    const validVillages = await this.repository.findAssignedVillageIds(
      c,
      microplanningId,
      [body.village_id]
    )

    if (validVillages.length === 0) {
      throw new VillageNotInMicroplanning()
    }

    // 2. Validate problem_type_id exists in config
    const problemTypes = await this.repository.getProblemTypesConfig(c)
    const problemType = problemTypes.find(
      (pt) => pt.id === body.problem_type_id
    )

    if (!problemType) {
      throw new InvalidProblemTypeId()
    }

    // 3. Validate problem_category_id exists in config
    const problemCategories =
      await this.repository.getProblemCategoriesConfig(c)
    const problemCategory = problemCategories.find(
      (pc) => pc.id === body.problem_category_id
    )

    if (!problemCategory) {
      throw new InvalidProblemCategoryId()
    }

    // 4. Validate problem_category_id matches problem_type_id (only for non-custom categories)
    if (
      problemCategory.problem_type_id !== null &&
      problemCategory.problem_type_id !== body.problem_type_id
    ) {
      throw new ProblemCategoryMismatch()
    }

    // 5. Validate problem_category_name is provided when category is custom (is_custom = 1)
    if (problemCategory.is_custom === 1) {
      if (
        !body.problem_category_name ||
        body.problem_category_name.trim() === ""
      ) {
        throw new ProblemCategoryNameMissing()
      }
    }

    // 6. Validate solution is provided unless the category marks it as not required
    if (problemCategory.is_solution_required !== 0) {
      if (!body.solution || body.solution.trim() === "") {
        throw new SolutionRequired()
      }
    }

    return body
  }

  validateUpdate = async (c: Context, body: UpdateProblemSolution) => {
    const microplanningId = c.var.microplanningId!
    const id = Number(c.req.param("id"))

    // 1. Validate solution record exists
    const records = await this.repository.findByIdsAndMicroplanning(
      c,
      [id],
      microplanningId
    )

    if (records.length === 0) {
      throw new ProblemSolutionNotFound()
    }

    const existingRecord = records[0]!

    // 2. Validate village_id matches existing record (cannot change)
    if (existingRecord.village_id !== body.village_id) {
      throw new InvalidVillageId()
    }

    // 3. Validate problem_type_id (cannot change)
    if (existingRecord.problem_type_id !== body.problem_type_id) {
      throw new InvalidProblemTypeId()
    }

    // other validation is the same as create
    return this.validateCreate(c, body)
  }

  validateVillageExists = async (c: Context, villageId: number) => {
    const microplanningId = c.var.microplanningId!

    const validVillages = await this.repository.findAssignedVillageIds(
      c,
      microplanningId,
      [villageId]
    )

    if (validVillages.length === 0) {
      throw new VillageNotInMicroplanning()
    }

    return true
  }
}
