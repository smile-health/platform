import { NotFoundError, ValidationError } from "@smile-health/lib/error.js"

export class ProblemSolutionNotFound extends NotFoundError {
  constructor() {
    super("validator.microplanning.problem_solution_not_found")
  }
}

export class InvalidVillageId extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_village_id")
  }
}

export class InvalidProblemTypeId extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_problem_type_id")
  }
}

export class InvalidProblemCategoryId extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_problem_category_id")
  }
}

export class ProblemCategoryMismatch extends ValidationError {
  constructor() {
    super("validator.microplanning.problem_category_mismatch")
  }
}

export class ProblemCategoryNameMissing extends ValidationError {
  constructor() {
    super("validator.microplanning.problem_category_name_missing")
  }
}

export class SolutionRequired extends ValidationError {
  constructor() {
    super("validator.microplanning.solution_required")
  }
}

export class DuplicateProblemSolution extends ValidationError {
  constructor() {
    super("validator.microplanning.duplicate_problem_solution")
  }
}

export class VillageNotInMicroplanning extends ValidationError {
  constructor() {
    super("validator.microplanning.village_not_in_microplanning")
  }
}
