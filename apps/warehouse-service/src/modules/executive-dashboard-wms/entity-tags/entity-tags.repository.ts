import { Context } from "hono"
import { execQuery } from "@/common/infrastructure/database/index.js"
import { EntityTagsQuery } from "./entity-tags.query.js"
import { EntityTagDTO, EntityTagsQueryParams } from "./entity-tags.schema.js"

export class EntityTagsRepository {
  constructor(private readonly query: EntityTagsQuery) {}

  async fetchEntityTags(
    c: Context,
    params: EntityTagsQueryParams
  ): Promise<EntityTagDTO[]> {
    const query = this.query.getEntityTagsQuery(params)
    const result = await execQuery<EntityTagDTO[]>(query, {})
    return result || []
  }

  async getTotalCount(c: Context): Promise<number> {
    const query = this.query.getTotalCountQuery()
    const result = await execQuery<{ total: number }[]>(query, {})
    return result[0]?.total || 0
  }
}
