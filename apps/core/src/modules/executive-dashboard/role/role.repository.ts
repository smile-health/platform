import { BaseRepository } from "@/modules/base.repository"
import { Context } from "hono"
import { RoleRequest } from "./role.schema"

export class ExecutiveRoleRepository extends BaseRepository<"executive_roles"> {
  constructor() {
    super("executive_roles", false)
  }

  async findAll(c: Context, queryParam: RoleRequest) {
    let query = c.var.trx
      .selectFrom("executive_roles")
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
