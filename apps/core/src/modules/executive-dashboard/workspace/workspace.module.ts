import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import { ExecutiveWorkspaceRepository } from "./workspace.repository.js"
import { GetWorkspacesParams } from "./workspace.schema.js"

export class ExecutiveWorkspaceModule {
  constructor(private readonly repository: ExecutiveWorkspaceRepository) {}
  async getList(c: Context, queryParam: GetWorkspacesParams) {
    const { data, total } = await this.repository.findAll(c, queryParam)
    return new PaginatedResponse(queryParam, data, Number(total))
  }
}
