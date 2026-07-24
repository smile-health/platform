import { Context } from "hono"
import { EntityTagsRepository } from "./entity-tags.repository.js"
import {
  EntityTagsQueryParams,
  EntityTagsResponse,
  EntityTagItem,
} from "./entity-tags.schema.js"

export class EntityTagsModule {
  private static readonly LIST_PAGINATION = [10, 25, 50, 100]

  constructor(private readonly repository: EntityTagsRepository) {}

  async getEntityTags(
    c: Context,
    params: EntityTagsQueryParams
  ): Promise<EntityTagsResponse> {
    const [entityTags, totalCount] = await Promise.all([
      this.repository.fetchEntityTags(c, params),
      this.repository.getTotalCount(c),
    ])

    const data: EntityTagItem[] = entityTags.map((tag) => ({
      id: tag.id,
      title: tag.title ? c.var.t(`entity_tag.label.${tag.title}`) : "",
    }))

    const totalPage = Math.ceil(totalCount / params.item_per_page)

    return {
      page: params.page,
      item_per_page: params.item_per_page,
      total_item: totalCount,
      total_page: totalPage,
      list_pagination: EntityTagsModule.LIST_PAGINATION,
      data,
    }
  }
}
