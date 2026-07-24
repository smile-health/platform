import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { Context } from "hono"
import { ExecutiveMaterialTypeRepository } from "./material-type.repository.js"
import { MaterialTypeRequest } from "./material-type.schema.js"

export class ExecutiveMaterialTypeModule {
  constructor(private readonly repo: ExecutiveMaterialTypeRepository) {}

  async list(c: Context, queryParam: MaterialTypeRequest) {
    const { data, total } = await this.repo.findAll(c, queryParam)

    if (data.length === 0) {
      return new PaginatedResponse(queryParam)
    }

    const materialTypes = data.map((materialType) => {
      return {
        ...materialType,
        name: c.var.t(`material_type.label.${materialType.name}`),
      }
    })

    return new PaginatedResponse(queryParam, materialTypes, total)
  }
}
