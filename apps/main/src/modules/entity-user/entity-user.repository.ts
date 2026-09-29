import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "@smile-health/lib/types/context.js"
import { sql } from "kysely"
import { GetEntitiesUsersQueries } from "./entity-user.schema.js"

export class EntityUserRepository {
  async getListEntityUser(
    c: Context<DB>,
    params: GetEntitiesUsersQueries,
    id: number,
    programId: number
  ) {
    const { page, paginate, keyword } = params
    const offset = (page - 1) * paginate
    let query = c.var.trx
      .selectFrom("users")
      .where("entity_id", "=", id)

      .select([
        "username",
        sql<string>`CONCAT_WS(' ', firstname, lastname)`.as("full_name"),
        "role",
        "mobile_phone as phone_number",
      ])

    if (keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("username", "like", `%${keyword}%`),
          eb("firstname", "like", `%${keyword}%`),
          eb("lastname", "like", `%${keyword}%`),
        ])
      )
    }

    const [list, totalList] = await Promise.all([
      query.limit(paginate).offset(offset).execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return { list, total: Number(totalList?.total) || 0 }
  }

  async getTotalCountEntityUser(
    c: Context<DB>,
    params: GetEntitiesUsersQueries,
    id: number
  ) {
    const { keyword } = params
    let query = c.var.trx.selectFrom("users").where("entity_id", "=", id)

    if (keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("username", "like", `%${keyword}%`),
          eb("firstname", "like", `%${keyword}%`),
          eb("lastname", "like", `%${keyword}%`),
        ])
      )
    }

    const totalEntityUser = await query
      .select((eb) => eb.fn.countAll().as("total"))
      .executeTakeFirst()

    return Number(totalEntityUser?.total) || 0
  }
}
