import { collect, differ } from "@smile-health/lib/utils.js"
import { Context } from "hono"
import {
  CreateUserWorkspaceRequest,
  GetWorkspacesParams,
} from "./workspace.schema.js"
import { sql } from "kysely"
import { BaseRepository } from "@/modules/base.repository.js"

export class ExecutiveWorkspaceRepository extends BaseRepository<"executive_workspaces"> {
  constructor() {
    super("executive_workspaces")
  }

  async findAll(c: Context, queryParam: GetWorkspacesParams) {
    let query = c.var.trx.selectFrom("executive_workspaces")

    if (queryParam.keyword) {
      query = query.where((eb) =>
        eb.or([
          eb("key", "like", `%${queryParam.keyword}%`),
          eb("name", "like", `%${queryParam.keyword}%`),
        ])
      )
    }

    if (
      queryParam.is_material_hierarchy_enabled === 1 ||
      queryParam.is_material_hierarchy_enabled === 0
    ) {
      const isHierarchyEnabled = queryParam.is_material_hierarchy_enabled
        ? true
        : false
      query = query.where(
        sql<boolean>`JSON_EXTRACT(config, '$.material.is_hierarchy_enabled')`,
        "=",
        isHierarchyEnabled
      )
    }

    if (queryParam.sort_by) {
      const sortType = queryParam.sort_type || "asc"

      if (queryParam.sort_by === "is_hierarchy_enabled") {
        query = query.orderBy(
          sql<number>`
            CAST(
              JSON_EXTRACT(config, '$.material.is_hierarchy_enabled')
              AS UNSIGNED
            )
          `,
          sortType
        )
      } else {
        query = query.orderBy(queryParam.sort_by, sortType)
      }
    }

    const isPaginate = queryParam.page && queryParam.paginate ? true : false
    const offset = (queryParam.page - 1) * queryParam.paginate

    const [workspaces, count] = await Promise.all([
      query
        .$if(isPaginate, (qb) => qb.limit(queryParam.paginate).offset(offset))
        .selectAll()
        .execute(),
      query
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data: workspaces,
      total: count.total,
    }
  }

  async getUserProgramIds(c: Context, id: number) {
    const programUsers = await c.var.trx
      .selectFrom("executive_users_workspaces as uw")
      .innerJoin("executive_workspaces as ws", "ws.id", "uw.workspace_id")
      .where("uw.user_id", "=", id)
      .where("uw.deleted_at", "is", null)
      .where("ws.deleted_at", "is", null)
      .select(["uw.workspace_id as id"])
      .execute()

    return collect(programUsers, "id")
  }

  async getUserPrograms(c: Context, ids: number | number[]) {
    if (typeof ids === "number") ids = [ids]
    if (!ids || ids.length === 0) return {}
    const workspaces = await c.var.trx
      .selectFrom("executive_workspaces as w")
      .innerJoin("executive_users_workspaces as uw", "w.id", "uw.workspace_id")
      .innerJoin("executive_users as u", "u.id", "uw.user_id")
      .where("u.id", "in", ids)
      .where("w.deleted_at", "is", null)
      .where("uw.deleted_at", "is", null)
      .select([
        "w.id",
        "w.key",
        "w.name",
        "w.description",
        "uw.status",
        "uw.user_id",
        "w.is_beneficiaries",
      ])
      .where("w.deleted_at", "is", null)
      .execute()

    return workspaces.reduce((mapWorkspace, workspace) => {
      if (!mapWorkspace[workspace["user_id"]]) {
        mapWorkspace[workspace["user_id"]] = []
      }
      mapWorkspace[workspace["user_id"]].push(workspace)
      return mapWorkspace
    }, {})
  }

  async attachWithUserID(c: Context, userId: number, programIds: number[]) {
    if (programIds.length === 0) return

    const wsUsers = await c.var.trx
      .selectFrom("executive_users_workspaces as uw")
      .where("uw.user_id", "=", userId)
      .select([
        "uw.id",
        "uw.workspace_id as program_id",
        "uw.user_id as global_id",
        "uw.deleted_at",
      ])
      .execute()

    const programIdsExist =
      wsUsers.length > 0 ? collect(wsUsers, "program_id") : []
    const programIdsDiffer = differ(programIds, programIdsExist)

    const dataDiffer: CreateUserWorkspaceRequest[] = []
    programIdsDiffer.forEach((programId) => {
      dataDiffer.push({
        user_id: userId,
        workspace_id: programId,
      })
    })

    if (programIdsExist.length)
      await c.var.trx
        .updateTable("executive_users_workspaces")
        .set({
          deleted_at: new Date(), // soft delete
        })
        .where("user_id", "=", userId)
        .where("workspace_id", "in", programIdsExist)
        .execute()

    // create program if not exist in user workspace
    if (dataDiffer.length) {
      await c.var.trx
        .insertInto("executive_users_workspaces")
        .values(dataDiffer)
        .execute()
    }

    // remove soft delete according to the program_id sent
    if (programIds.length) {
      await c.var.trx
        .updateTable("executive_users_workspaces")
        .set({
          deleted_at: null, // remove soft delete
        })
        .where("user_id", "=", userId)
        .where("workspace_id", "in", programIds)
        .execute()
    }
  }
}
