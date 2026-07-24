import { associate } from "@smile/lib/utils.js"
import { Context } from "hono"
import { canGetRoles } from "../integration/integration.schema"
import { GetRolesResponse } from "../integration/wms/wms.schema"

export class RoleRepository {
  async getRoles(c: Context) {
    const { client } = c.var
    if (!client || !canGetRoles(client))
      return await c.var.trx.selectFrom("roles").selectAll().execute()

    const resp = await client.getRoles()
    const body = resp.response.body as unknown as GetRolesResponse
    return body.data.data.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
    }))
  }

  async findByID(c: Context, roleID: number = 0) {
    const { client } = c.var
    if (!client || !canGetRoles(client))
      return await c.var.trx
        .selectFrom("roles")
        .selectAll()
        .where("id", "=", roleID)
        .executeTakeFirst()

    return (await this.getRoles(c)).filter((el) => el.id == roleID)[0]
  }

  async findByIDMapped(c: Context, roleIDs: number[]) {
    const { client } = c.var
    if (!client || !canGetRoles(client)) {
      const roles = await c.var.trx
        .selectFrom("roles")
        .selectAll()
        .where("id", "in", roleIDs)
        .execute()

      return associate(roles, "id")
    }

    const roles = await this.getRoles(c)
    const filteredRoles = roles.filter((el) => roleIDs.includes(el.id))

    return associate(filteredRoles, "id")
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
