import { NotFoundError, ValidationError } from "@smile/lib/error"
export class MicroplanningNotFound extends NotFoundError {
  constructor() {
    super("validator.microplanning.not_found")
  }
}

export class InvalidVillageId extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_village_id")
  }
}

export class InvalidPriorityAreaId extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_priority_area_id")
  }
}

export class InvalidPriorityRank extends ValidationError {
  constructor() {
    super("validator.microplanning.invalid_priority_rank")
  }
}

export class PriorityAreaNotFound extends NotFoundError {
  constructor() {
    super("validator.microplanning.priority_area_not_found")
  }
}
