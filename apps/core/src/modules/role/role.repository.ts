import { associate } from "@smile-health/lib/utils.js"
import { Context } from "hono"

export class RoleRepository {
  async getRoles(c: Context) {
    return await c.var.trx.selectFrom("roles").selectAll().execute()
  }

  async findByID(c: Context, roleID: number = 0) {
    return await c.var.trx
      .selectFrom("roles")
      .selectAll()
      .where("id", "=", roleID)
      .executeTakeFirst()
  }

  async findByIDMapped(c: Context, roleIDs: number[]) {
    const roles = await c.var.trx
      .selectFrom("roles")
      .selectAll()
      .where("id", "in", roleIDs)
      .execute()

    return associate(roles, "id")
  }

  async getClientRole(c: Context, roleIds?: number[]) {
    const roles = await c.var.trx
      .selectFrom("integration_mappings as im")
      .select(["internal_id", "external_id", "client_id"])
      .where("type", "=", "role")
      .$if(Array.isArray(roleIds) && roleIds.length > 0, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("internal_id", "in", roleIds!),
            eb("external_id", "in", roleIds!),
          ])
        )
      )
      .execute()
    return roles.reduce((acc, item) => {
      const { client_id, internal_id, external_id } = item

      if (!acc[client_id!]) {
        acc[client_id!] = {
          external_id: [],
          internal_id: [],
        }
      }

      acc[client_id!].external_id.push(Number(external_id))
      acc[client_id!].internal_id.push(Number(internal_id))

      return acc
    }, {})
  }

  async getClientRoleMapping(c: Context, clientId?: number) {
    if (!clientId) return {}

    const rows = await c.var.trx
      .selectFrom("integration_mappings as im")
      .innerJoin("roles as r", "r.id", "im.internal_id")
      .select(["internal_id", "external_id", "r.name as role_label"])
      .where("client_id", "=", clientId)
      .where("type", "=", "role")
      .execute()

    return associate(rows, "external_id")
  }
}
