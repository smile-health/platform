import {
  DEVICE_TYPE,
  USER_GENDER,
  USER_ROLE,
} from "@/common/constants/users.js"
import { Context } from "hono"
import moment from "moment"
import { BaseRepository } from "../../base.repository.js"
import { UpdateLastLoginRequest } from "./executive-user.schema.js"
import { TExistData } from "@/modules/user/user.schema.js"
import { associate, getLabelByKey } from "@smile/lib/utils.js"
import { ListQuery } from "../account/account.schema.js"
import { sql } from "kysely"

export class ExecutiveUserRepository extends BaseRepository<"executive_users"> {
  constructor() {
    super("executive_users", false)
  }

  userViewColumns(c: Context): string[] {
    const { role } = c.var

    const cols = [
      "users.address",
      "users.application_version",
      "users.change_password",
      "users.created_at",
      "users.created_by",
      "users.date_of_birth",
      "users.deleted_at",
      "users.deleted_by",
      "users.email",
      "users.entity_id",
      "users.external_properties",
      "users.fcm_token",
      "users.firstname",
      "users.gender",
      "users.id",
      "users.imei_number",
      "users.iota_app_gui_theme",
      "users.keycloak_uuid",
      "users.last_device",
      "users.last_login",
      "users.last_mobile_access",
      "users.lastname",
      "users.manufacture_id",
      "users.mobile_phone",
      "users.mobile_phone_2",
      "users.mobile_phone_brand",
      "users.mobile_phone_model",
      "users.password",
      "users.permission",
      "users.role",
      "users.sim_id",
      "users.sim_provider",
      "users.status",
      "users.timezone_id",
      "users.token_login",
      "users.updated_at",
      "users.updated_by",
      "users.user_uuid",
      "users.username",
      "users.view_only",
      "users.village_id",
    ]
    if (role === USER_ROLE.SUPERADMIN) {
      cols.push("users.daily_recap_email")
    }

    return cols
  }

  async updateUserLastAndFcmByUUID(
    c: Context,
    data: UpdateLastLoginRequest,
    id: string
  ) {
    return await c.var.trx
      .updateTable("executive_users")
      .set({
        fcm_token: data.fcm_token,
        last_login: moment().toDate(),
        last_device: DEVICE_TYPE[data.last_device!],
      })
      .where((eb) =>
        eb.or({
          keycloak_uuid: id,
          user_uuid: id,
        })
      )
      .executeTakeFirst()
  }

  async dataExists(c: Context, data: TExistData<string>) {
    let query = c.var.trx
      .selectFrom("executive_users as u")
      .leftJoin("executive_roles as r", "r.id", "u.role")
      .select([
        "u.id",
        "u.username",
        "u.firstname",
        "u.lastname",
        "u.email",
        "u.keycloak_uuid",
        "u.user_uuid",
        "r.name as role_label",
        "u.status",
      ])
      .where("u.deleted_at", "is", null)

    if (data.column == "id") {
      query = query.where("u.id", "=", Number(data.value.trim()))
    }
    if (data.column == "email") {
      query = query.where("u.email", "=", data.value)
    }
    if (data.column == "username") {
      query = query.where("u.username", "=", data.value)
    }

    const result = await query.executeTakeFirst()
    return result
  }

  async findByUsername(c: Context, username: string) {
    return c.var.trx
      .selectFrom("executive_users as u")
      .leftJoin("executive_roles as r", "r.id", "u.role")
      .where("username", "=", username)
      .where("u.deleted_at", "is", null)
      .selectAll("u")
      .select(["r.id as role_id", "r.name as role_label"])
      .executeTakeFirst()
  }

  async updateUserTokenLogin(c: Context, data: unknown, id: number) {
    return await c.var.trx
      .updateTable("executive_users")
      .set(data!)
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async invalidateToken(c: Context, userID: number) {
    await c.var.trx
      .updateTable("executive_users")
      .set({ token_login: null, fcm_token: null })
      .where("id", "=", userID)
      .executeTakeFirstOrThrow()
  }

  async findById(c: Context, id: number | string) {
    const cols = this.userViewColumns(c)

    const result = await c.var.trx
      .selectFrom("executive_users as users")
      .leftJoin("executive_roles as roles", "roles.id", "users.role")
      .$if(typeof id === "string", (qb) =>
        qb.where("users.user_uuid", "=", id as string)
      )
      .$if(typeof id !== "string", (qb) =>
        qb.where("users.id", "=", id as number)
      )
      .select(cols)
      .select(["roles.id as role_id", "roles.name as role_label"])
      .where("users.deleted_at", "is", null)
      .executeTakeFirst()

    const gender_label = getLabelByKey(USER_GENDER, result?.gender)

    return result
      ? {
          ...result,
          gender_label,
        }
      : null
  }

  async findAll(c: Context, queries: ListQuery) {
    const {
      sort_by,
      sort_type,
      paginate,
      offset,
      keyword,
      status,
      program_ids,
      role,
      start_date,
      end_date,
    } = queries
    const sortBy = sort_by
      ? sort_by === "role_label"
        ? sql`r.name`
        : sort_by === "fullname"
          ? sql`CONCAT_WS(' ', u.firstname, u.lastname)`
          : sql.raw(`u.${sort_by}`)
      : sql`u.updated_at`

    const sortType = sort_type ? sort_type : "desc"

    const query = c.var.trx
      .selectFrom("executive_users as u")
      .leftJoin("executive_roles as r", "r.id", "u.role")
      .select([
        "u.id",
        "u.username",
        "u.firstname",
        "u.lastname",
        sql<string>`CONCAT_WS(' ', firstname, lastname)`.as("fullname"),
        "u.address",
        "u.date_of_birth",
        "u.email",
        "u.gender",
        "u.last_device",
        "u.mobile_phone",
        "u.status",
        "u.view_only",
        "u.entity_id",
        "u.village_id",
        "u.manufacture_id",
        "u.role",
        "r.name as role_label",
        "u.user_uuid",
        "u.keycloak_uuid",
        "u.last_login",
        "u.created_at",
        "u.created_by",
        "u.updated_at",
        "u.updated_by",
        "u.deleted_at",
        "u.deleted_by",
      ])
      .$if(!!keyword, (qb) => qb.where("u.username", "like", `%${keyword}%`))
      .$if(status !== null, (qb) => qb.where("u.status", "=", status))
      .$if(!!role, (qb) => qb.where("u.role", "=", Number(role)))
      .$if(!!program_ids && program_ids.length > 0, (qb) =>
        qb.where((eb) =>
          eb.exists(
            eb
              .selectFrom("executive_users_workspaces as uw")
              .select("uw.user_id")
              .whereRef("uw.user_id", "=", "u.id")
              .where("uw.workspace_id", "in", program_ids!)
          )
        )
      )
      .$if(!!start_date && !!end_date, (qb) =>
        qb.where((eb) =>
          eb.and([
            eb("u.last_login", ">=", start_date!),
            eb("u.last_login", "<=", end_date!),
          ])
        )
      )
      .where("u.deleted_at", "is", null)
      .orderBy(sortBy, sortType)

    const [users, count] = await Promise.all([
      query.limit(paginate).offset(offset).execute(),
      query
        .clearSelect()
        .select((fn) => fn.fn.countAll().as("total"))
        .executeTakeFirst(),
    ])

    return {
      users,
      total: Number(count?.total ?? 0),
    }
  }

  async findBasicUserMappedByIds(c: Context, ids: number[]) {
    const users = await c.var.trx
      .selectFrom("executive_users")
      .where("deleted_at", "is", null)
      .where("id", "in", ids)
      .select(["id", "username", "firstname", "lastname", "email", "status"])
      .execute()

    return associate(users, "id")
  }

  async findUsernameExceptId(c: Context, username: string, id: number) {
    return await c.var.trx
      .selectFrom("executive_users")
      .where("deleted_at", "is", null)
      .where("username", "=", username)
      .where("id", "!=", id)
      .select(["id", "username", "email", "status"])
      .executeTakeFirst()
  }

  async findEmailExceptId(c: Context, email: string, id: number) {
    return await c.var.trx
      .selectFrom("executive_users")
      .where("deleted_at", "is", null)
      .where("email", "=", email)
      .where("id", "!=", id)
      .select(["id", "username", "email", "status"])
      .executeTakeFirst()
  }

  async checkUsernameEmail(
    c: Context,
    username: string,
    email: string,
    isFindAll: boolean = false
  ) {
    const query = c.var.trx
      .selectFrom("executive_users as u")
      .leftJoin("executive_roles as r", "r.id", "u.role")
      .where("u.deleted_at", "is", null)
      .where((eb) =>
        eb.or([eb("u.username", "=", username), eb("u.email", "=", email)])
      )
      .select([
        "u.id",
        "u.username",
        "u.email",
        "u.firstname",
        "u.lastname",
        "u.role",
        "r.name as role_label",
        "u.keycloak_uuid",
        "u.user_uuid",
        "u.status",
      ])

    if (isFindAll) {
      return await query.execute()
    } else {
      return await query.executeTakeFirst()
    }
  }
}
