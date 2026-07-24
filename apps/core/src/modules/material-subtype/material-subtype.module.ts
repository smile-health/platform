import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { Context } from "hono"
import { MaterialSubtypeRepository } from "./material-subtype.repository.js"
import { GetListSubtypeQueries } from "./material-subtype.schema.js"

export class MaterialSubtypeModule {
  constructor(private readonly repository: MaterialSubtypeRepository) {}

  async list(c: Context, params: GetListSubtypeQueries) {
    const { list, total } = await this.repository.getListSubtype(c, params)
    const processedList = list.map((subtype) => ({
      ...subtype,
      name: c.var.t(`material_subtype.label.${subtype.name}`),
    }))
    return new PaginatedResponse(params, processedList, total)
  }
}
