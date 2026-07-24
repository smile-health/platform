import { Context } from "hono"
import {
  InvalidPriorityAreaId,
  InvalidPriorityRank,
  InvalidVillageId,
  PriorityAreaNotFound,
} from "./priority-areas.error.js"
import { PriorityAreasRepository } from "./priority-areas.repository.js"
import {
  CreatePriorityArea,
  UpdatePriorityArea,
  UpdateRankings,
} from "./priority-areas.schema.js"

export class PriorityAreasMiddleware {
  constructor(private readonly repository: PriorityAreasRepository) {}

  validateCreate = async (c: Context, body: CreatePriorityArea) => {
    const microplanningId = c.var.microplanningId!

    // Validate village_id exists in microplanning villages for this microplanning
    const validVillages = await this.repository.findAssignedVillageIds(
      c,
      microplanningId,
      [body.village_id]
    )

    if (validVillages.length === 0) {
      throw new InvalidVillageId()
    }

    return body
  }

  validateUpdate = async (c: Context, body: UpdatePriorityArea) => {
    const microplanningId = c.var.microplanningId!
    const id = Number(c.req.param("id"))

    // Validate the priority area record exists and belongs to this microplanning
    const records = await this.repository.findByIdsAndMicroplanning(
      c,
      [id],
      microplanningId
    )

    if (records.length === 0) {
      throw new PriorityAreaNotFound()
    }

    // Validate the existing record's village_id matches the village_id in the request body
    const existingRecord = records[0]
    if (existingRecord.village_id !== body.village_id) {
      throw new InvalidVillageId()
    }

    // Validate village_id exists in microplanning villages for this microplanning
    const validVillages = await this.repository.findAssignedVillageIds(
      c,
      microplanningId,
      [body.village_id]
    )

    if (validVillages.length === 0) {
      throw new InvalidVillageId()
    }

    return body
  }

  validateUpdateRankings = async (c: Context, body: UpdateRankings) => {
    const microplanningId = c.var.microplanningId!

    // Collect all ids
    const ids = body.map((item: { id: number }) => item.id).filter(Boolean)

    // Validate ids - check they exist and belong to this microplanning
    if (ids.length > 0) {
      const validRecords = await this.repository.findByIdsAndMicroplanning(
        c,
        ids,
        microplanningId
      )

      const validIds = new Set(validRecords.map((r) => r.id))
      for (const id of ids) {
        if (!validIds.has(id)) {
          throw new InvalidPriorityAreaId()
        }
      }
    }

    // Validate priority_rank - can't be more than the number of rows
    const totalRows = await this.repository.countByMicroplanningId(
      c,
      microplanningId
    )

    for (const item of body) {
      if (item.priority_rank > totalRows) {
        throw new InvalidPriorityRank()
      }
    }

    return body
  }
}
