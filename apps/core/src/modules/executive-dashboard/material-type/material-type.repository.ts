import { Context } from "hono"
import { MaterialTypeRequest } from "./material-type.schema.js"

export class ExecutiveMaterialTypeRepository {
  async findAll(c: Context, queryParam: MaterialTypeRequest) {
    let query = c.var.trx
      .selectFrom("material_types")
      .where("deleted_at", "is", null)

    if (queryParam.keyword) {
      query = query.where("name", "like", `%${queryParam.keyword}%`)
    }

    const offset = (queryParam.page - 1) * queryParam.paginate
    const [list, count] = await Promise.all([
      query.limit(queryParam.paginate).offset(offset).selectAll().execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data: list,
      total: Number(count.total),
    }
  }
}
