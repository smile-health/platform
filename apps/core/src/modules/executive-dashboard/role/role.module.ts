import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { Context } from "hono"
import { ExecutiveRoleRepository } from "./role.repository.js"
import { RoleRequest } from "./role.schema.js"

export class ExecutiveRoleModule {
  constructor(private readonly repo: ExecutiveRoleRepository) {}

  async list(c: Context, queryParam: RoleRequest) {
    const { data, total } = await this.repo.findAll(c, queryParam)
    return new PaginatedResponse(queryParam, data, total)
  }
}
