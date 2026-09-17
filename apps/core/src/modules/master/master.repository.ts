import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { Context } from "hono"
import { TLocationPageable } from "./master.schema.js"

export class MasterRepository {
  async getLocations(c: Context, params: TLocationPageable) {
    let q = c.var.trx
      .selectFrom("locations")
      .selectAll()
      .where("level", "=", params.level!)
      .$if(params.parent_id![0]! > 0, (eb) =>
        eb.where("parent_id", "in", params.parent_id!)
      )

    if (params.keyword) {
      q = q.where("name", "like", `%${params.keyword}%`)
    }

    const offset = (params.page - 1) * params.paginate
    const [locations, count] = await Promise.all([
      q.limit(params.paginate).offset(offset).execute(),
      q.select((fn) => fn.fn.countAll().as("total")).executeTakeFirstOrThrow(),
    ])

    return new PaginatedResponse(params, locations, Number(count.total))
  }

  async findLocationsByIds(c: Context, locationIDs: number[]) {
    return await c.var.trx
      .selectFrom("locations")
      .where("id", "in", locationIDs)
      .selectAll()
      .execute()
  }

  // For each requested (typically leaf) id, resolves every ancestor along
  // its materialized "#"-delimited root->self `path` (e.g. entity.repository
  // .ts's #resolveLocationPaths uses the same column) and returns the union
  // of {id, name, level} across all requested ids -- everything a frontend
  // LocationPicker needs to re-seed each cascade level's label after a
  // full page reload, when it only has raw leaf ids (e.g. from a URL
  // query param) and no label/level/ancestor data of its own.
  async getAncestorsByIds(c: Context, locationIDs: number[]) {
    if (locationIDs.length === 0) return []

    const leaves = await c.var.trx
      .selectFrom("locations")
      .select(["id", "path"])
      .where("id", "in", locationIDs)
      .execute()

    const ancestorIds = new Set<number>()
    for (const leaf of leaves) {
      const chain = (leaf.path ?? String(leaf.id))
        .split("#")
        .map(Number)
        .filter((id) => !isNaN(id))
      chain.forEach((id) => ancestorIds.add(id))
      ancestorIds.add(leaf.id)
    }

    if (ancestorIds.size === 0) return []

    return c.var.trx
      .selectFrom("locations")
      .select(["id", "name", "level"])
      .where("id", "in", [...ancestorIds])
      .execute()
  }

  // The hierarchy's actual depth, as a live fact rather than a hardcoded
  // constant -- adding a 5th administrative level later is a data change
  // (new rows at level 4), not a code change.
  async getMaxLocationLevel(c: Context): Promise<number> {
    const result = await c.var.trx
      .selectFrom("locations")
      .select((eb) => eb.fn.max("level").as("maxLevel"))
      .executeTakeFirst()

    return result?.maxLevel ?? 0
  }
}
