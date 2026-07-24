import { EntityTagsQueryParams } from "./entity-tags.schema.js"

export class EntityTagsQuery {
  private readonly tableName = "raw_entity_tags"

  getEntityTagsQuery(params: EntityTagsQueryParams): string {
    const offset = (params.page - 1) * params.item_per_page
    const limit = params.item_per_page

    return `
      SELECT 
        id,
        title
      FROM ${this.tableName}
      WHERE deleted_at IS NULL
        AND id IN (9, 11)
      ORDER BY id ASC
      LIMIT ${limit}
      OFFSET ${offset}
      SETTINGS max_execution_time = 10
    `
  }

  getTotalCountQuery(): string {
    return `
      SELECT 
        COUNT(*) as total
      FROM ${this.tableName}
      WHERE deleted_at IS NULL
        AND id IN (9, 11)
      SETTINGS max_execution_time = 10
    `
  }
}
