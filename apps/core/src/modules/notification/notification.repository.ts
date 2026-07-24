import { USER_ROLE } from "@/common/constants/users"
import { ENTITY_TAG } from "@/common/constants/entity"
import { notificationDb as db } from "@/common/infrastructure/database/index.js"
import {
  GetNotificationsQueryParams,
  GetNotificationsTypesPagination,
} from "@/modules/notification/notification.schema"
import { Context } from "hono"
import { Selectable, sql, SelectQueryBuilder } from "kysely"
import { NotificationDatabase } from "@/common/infrastructure/database/types/index.js"

type UserEntityAttributes = {
  id: number
  global_id: number
  entity_tag_id: number
  province_id: number | null
  regency_id: number | null
}

export class NotificationRepository {
  async getListNotification(
    c: Context,
    params: GetNotificationsQueryParams,
    entityIdList: number[]
  ) {
    const {
      page,
      paginate,
      province_id,
      city_id,
      city_district_id,
      health_center_id,
      receive_date,
      notification_type,
      entity_tag_ids,
      program_ids,
      limit,
    } = params
    const offset = (page - 1) * paginate

    let entityIds: number[] = entityIdList

    const getUserEntity = await this.getUserEntityAttributes(c)
    const userRole = Number(c.var.role)

    if (entity_tag_ids) {
      const queryEntities = await c.var.trx
        .selectFrom("ws_entities")
        .select(["id"])
        .where("entity_tag_id", "in", entity_tag_ids)
        .$if(entityIds.length > 0, (b) => b.where("global_id", "in", entityIds))
        .execute()

      if (queryEntities && queryEntities.length > 0) {
        entityIds = queryEntities.map((item) => item.id)
      } else {
        entityIds = [0]
      }
    }

    let queries = db.selectFrom("notifications as n").where("media", "=", "fcm")
    const paramRegencyId = city_id ?? city_district_id

    if (
      !province_id &&
      !paramRegencyId &&
      !health_center_id &&
      ![USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(userRole)
    ) {
      const userEntityTag = Number(getUserEntity?.entity_tag_id)

      switch (userEntityTag) {
        case ENTITY_TAG.PROVINCE_HEALTH_OFFICE:
          queries = queries.where(
            "province_id",
            "=",
            Number(getUserEntity?.province_id)
          )
          break
        case ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE:
          queries = queries.where(
            "regency_id",
            "=",
            Number(getUserEntity?.regency_id)
          )
          break
        default:
          queries = queries.where("entity_id", "=", Number(getUserEntity?.id))
          break
      }
    }

    if (
      !province_id &&
      !city_id &&
      !health_center_id &&
      ![USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(userRole)
    ) {
      const userEntityTag = Number(getUserEntity?.entity_tag_id)

      switch (userEntityTag) {
        case ENTITY_TAG.PROVINCE_HEALTH_OFFICE:
          queries = queries.where(
            "province_id",
            "=",
            Number(getUserEntity?.province_id)
          )
          break
        case ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE:
          queries = queries.where(
            "regency_id",
            "=",
            Number(getUserEntity?.regency_id)
          )
          break
        default:
          queries = queries.where("entity_id", "=", Number(getUserEntity?.id))
          break
      }
    }

    if (entityIds.length > 0) {
      queries = queries.where("entity_id", "in", entityIds)
    }

    if (province_id) {
      queries = queries.where("province_id", "=", province_id)
    }

    if (paramRegencyId) {
      queries = queries.where("regency_id", "=", paramRegencyId)
    }

    if (health_center_id) {
      const entitiesFromGlobal = await this.getEntityById(c, health_center_id)
      const ids = entitiesFromGlobal?.map((item) => item.id)
      queries = queries.where("entity_id", "in", ids)
    }

    if (notification_type) {
      queries = queries.where("type", "=", notification_type)
    }

    if (receive_date) {
      const startDate = new Date(receive_date)
      const endDate = new Date(receive_date)
      endDate.setDate(endDate.getDate() + 1)

      queries = queries
        .where("created_at", ">=", sql.lit(startDate))
        .where("created_at", "<", sql.lit(endDate))
    }

    if (program_ids) {
      queries = queries.where("program_id", "in", program_ids)
    } else if (c.var.user.role !== USER_ROLE.SUPERADMIN) {
      const workspaces = await c.var.trx
        .selectFrom("user_workspaces")
        .select("workspace_id")
        .where("user_id", "=", c.var.user.id)
        .where("deleted_at", "is", null)
        .execute()

      const workspaceIds = workspaces.map((item) => item.workspace_id)

      queries = queries.where((eb) =>
        workspaceIds.length > 0
          ? eb.or([
              eb("program_id", "in", workspaceIds),
              eb("program_id", "is", null),
            ])
          : eb("program_id", "is", null)
      )
    }

    let list: Selectable<NotificationDatabase["notifications"]>[] = []
    let total: number = 0

    if (limit) {
      list = await queries
        .selectAll()
        .orderBy("id", "desc")
        .limit(limit)
        .offset(offset)
        .execute()

      total = list.length
    } else {
      const [fetchedList, totalResult] = await Promise.all([
        queries
          .selectAll()
          .orderBy("id", "desc")
          .limit(paginate)
          .offset(offset)
          .execute(),
        queries.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
      ])

      list = fetchedList
      total = Number(totalResult?.total) || 0
    }

    return {
      list,
      total,
    }
  }

  async updateNotification(id: number, data) {
    await db
      .updateTable("notifications")
      .set(data)
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async getLocationById(c: Context, id: number, level: number) {
    return await c.var.trx
      .selectFrom("locations")
      .selectAll()
      .where("id", "=", id)
      .where("level", "=", level)
      .executeTakeFirst()
  }

  async getEntityTagByIds(c: Context, ids: number[]) {
    return await c.var.trx
      .selectFrom("entity_tags")
      .selectAll()
      .where("id", "in", ids)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getProgramByIds(c: Context, ids: number[]) {
    return await c.var.trx
      .selectFrom("workspaces")
      .selectAll()
      .where("id", "in", ids)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getEntityById(c: Context, id: number) {
    const dataQuery = c.var.trx
      .selectFrom("ws_entities")
      .selectAll()
      .where("global_id", "=", id)
      .where("deleted_at", "is", null)

    return await dataQuery.execute()
  }

  async getEntityIdByProvinceIdOrRegencyId(
    c: Context,
    provinceId: number | undefined,
    regencyId: number | undefined
  ) {
    const query = c.var.trx
      .selectFrom("ws_entities as we")
      .select(["we.id", "we.global_id"])
      .where((eb) => {
        const andConditions = [eb("we.deleted_at", "is", null)]

        if (provinceId) {
          andConditions.push(eb("we.province_id", "=", String(provinceId)))
        }
        if (regencyId) {
          andConditions.push(eb("we.regency_id", "=", String(regencyId)))
        }

        return eb.and(andConditions)
      })

    return await query.executeTakeFirst()
  }

  async getProvinceIdByRegencyId(c: Context, regencyId: number) {
    const location = await c.var.trx
      .selectFrom("locations")
      .select("parent_id")
      .where("id", "=", regencyId)
      .executeTakeFirst()

    return location?.parent_id
  }

  async getUserByIds(c: Context, ids: number[]) {
    if (ids.length === 0) return []

    return await c.var.trx
      .selectFrom("ws_users")
      .select(["id", "username", "firstname", "lastname", "role", "entity_id"])
      .where("id", "in", ids)
      .execute()
  }

  async getEntityByIds(c: Context, ids: number[]) {
    if (ids.length === 0) return []

    return await c.var.trx
      .selectFrom("ws_entities")
      .select([
        "id",
        "name",
        "province_id",
        "regency_id",
        "sub_district_id",
        "type",
        "is_puskesmas",
        "entity_tag_id",
      ])
      .where("global_id", "in", ids)
      .execute()
  }

  async getLocationByIds(c: Context, ids: number[]) {
    if (ids.length === 0) return []

    return await c.var.trx
      .selectFrom("locations")
      .select(["id", "name"])
      .where("id", "in", ids)
      .execute()
  }

  async getNotificationById(id: number) {
    return await db
      .selectFrom("notifications")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async updateNotificationsMarkedAllRead(ids: number[], data) {
    await db
      .updateTable("notifications")
      .set(data)
      .where("id", "in", ids)
      .execute()
  }

  private translateNotifType(c: Context, input: string) {
    const prefix = "notification.type."

    if (input.startsWith(prefix)) {
      return c.var.t(input)
    }

    const translated = c.var.t(prefix + input)

    if (translated !== prefix + input) {
      return translated
    }

    return input
  }

  async getListNotificationType(
    c: Context,
    params: GetNotificationsTypesPagination
  ) {
    const { page, paginate, keyword } = params
    const offset = (page - 1) * paginate
    const query = await c.var.trx
      .selectFrom("notification_types")
      .select(["id", "title", "type"])
      .where("deleted_at", "is", null)
      .execute()

    let result = query.map(({ title, ...item }) => ({
      ...item,
      title: this.translateNotifType(c, String(title)),
    }))

    if (keyword)
      result = result.filter((item) =>
        new RegExp(keyword, "i").test(item.title)
      )

    return {
      list: result.slice(offset, offset + paginate),
      total: result.length,
    }
  }

  async getEntityByProvince(c: Context, provinceIds: string[]) {
    return await c.var.trx
      .selectFrom("ws_entities")
      .select(["id"])
      .where((eb) =>
        eb.or([
          eb.and([
            eb("province_id", "in", provinceIds),
            eb("regency_id", "is", null),
            eb("sub_district_id", "is", null),
            eb("village_id", "is", null),
            eb("type", "=", 1),
            eb("is_puskesmas", "=", 0),
          ]),
          eb.and([
            eb("province_id", "in", provinceIds),
            eb("sub_district_id", "is", null),
            eb("village_id", "is", null),
            eb("type", "=", 2),
            eb("is_puskesmas", "=", 0),
          ]),
          eb.and([
            eb("province_id", "in", provinceIds),
            eb("village_id", "is", null),
            eb("type", "=", 3),
            eb("is_puskesmas", "=", 1),
          ]),
        ])
      )
      .where("deleted_at", "is", null)
      .execute()
  }

  async getEntityByRegency(c: Context, regencyIds: string[]) {
    return await c.var.trx
      .selectFrom("ws_entities")
      .select(["id"])
      .where((eb) =>
        eb.or([
          eb.and([
            eb("regency_id", "in", regencyIds),
            eb.or([
              eb("sub_district_id", "is", null),
              eb("sub_district_id", "=", ""),
            ]),
            eb.or([eb("village_id", "is", null), eb("village_id", "=", "")]),
            eb("type", "=", 2),
            eb("is_puskesmas", "=", 0),
          ]),
          eb.and([
            eb("regency_id", "in", regencyIds),
            eb.or([eb("village_id", "is", null), eb("village_id", "=", "")]),
            eb("type", "=", 3),
            eb("is_puskesmas", "=", 1),
          ]),
        ])
      )
      .where("deleted_at", "is", null)
      .execute()
  }

  async getWorkspaceByIds(c: Context, ids: number[]) {
    if (ids.length === 0) return []

    return await c.var.trx
      .selectFrom("workspaces")
      .select(["id", "key", "name", "config"])
      .where("id", "in", ids)
      .execute()
  }

  async getListNotificationForCount(c: Context, entityIdList: number[]) {
    const weekAgo = new Date()
    weekAgo.setHours(0, 0, 0, 0) // set ke jam 00:00 hari ini
    weekAgo.setDate(weekAgo.getDate() - 7) // mundur 7 hari

    let query = db
      .selectFrom("notifications as n")
      .select((eb) => [
        eb.fn.count<number>("n.id").as("all"),
        eb.fn
          .sum<number>(
            eb.case().when("n.read_at", "is", null).then(1).else(0).end()
          )
          .as("unread"),
        eb.fn
          .sum<number>(
            eb.case().when("n.read_at", "is not", null).then(1).else(0).end()
          )
          .as("read"),
      ])
      .where("media", "=", "fcm")
      .where("created_at", ">=", (eb) => eb.val(weekAgo))

    if (entityIdList.length > 0) {
      query = query.where("entity_id", "in", entityIdList)
    }

    const result = await query.executeTakeFirst()

    return {
      all: result?.all ?? 0,
      unread: result?.unread ?? 0,
      read: result?.read ?? 0,
    }
  }

  async getListNotificationUnread(c: Context, entityIdList: number[]) {
    let queries = db
      .selectFrom("notifications as n")
      .where("media", "=", "fcm")
      .where("user_id", "=", c.var.accountID)

    if (entityIdList.length > 0) {
      queries = queries.where("entity_id", "in", entityIdList)
    }

    queries = queries.where("read_at", "is", null)

    const list = await queries.selectAll().orderBy("id", "desc").execute()

    return list
  }

  private async getUserEntityAttributes(c: Context) {
    const userEntityId = c.var.user.entity_id

    return c.var.trx
      .selectFrom("ws_entities as we")
      .select([
        "we.id",
        "we.global_id",
        "we.entity_tag_id",
        "we.province_id",
        "we.regency_id",
      ])
      .where("we.global_id", "=", userEntityId)
      .where("we.deleted_at", "is", null)
      .executeTakeFirst() as Promise<UserEntityAttributes | undefined>
  }

  private applyNotificationScope<O>({
    query,
    entity,
    userEntityId,
    userId,
  }: {
    query: SelectQueryBuilder<NotificationDatabase, "notifications", O>
    entity: UserEntityAttributes
    userEntityId: number
    userId: number
  }) {
    switch (Number(entity.entity_tag_id)) {
      case ENTITY_TAG.PROVINCE_HEALTH_OFFICE:
        return query.where(
          "notifications.province_id",
          "=",
          Number(entity.province_id)
        )

      case ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE:
        return query.where(
          "notifications.regency_id",
          "=",
          Number(entity.regency_id)
        )

      default:
        return query
          .where("notifications.entity_id", "=", userEntityId)
          .where("notifications.user_id", "=", userId)
    }
  }

  async checkUserProgramIsAssigned(
    c: Context,
    params: Partial<GetNotificationsQueryParams>
  ) {
    const userProgramIds = c.var.mapWsUserId
      ? Object.keys(c.var.mapWsUserId)?.map(Number)
      : []
    const programIds = params.program_ids
    const programIdsList = programIds?.map(Number)
    if (!programIdsList || programIdsList.length === 0) return true

    return programIdsList.every((id) => userProgramIds.includes(id))
  }

  async checkEntityIsMatch(
    c: Context,
    params: Partial<GetNotificationsQueryParams>
  ) {
    const entity = await this.getUserEntityAttributes(c)

    if (!entity) return false

    const { province_id, health_center_id, city_id, city_district_id } = params
    const paramRegencyId = city_id ?? city_district_id
    const provinceId = province_id ?? undefined
    const regencyId = paramRegencyId ?? undefined

    switch (Number(entity.entity_tag_id)) {
      case ENTITY_TAG.PROVINCE_HEALTH_OFFICE:
        if (health_center_id) {
          const getEntityId = await this.getEntityIdByProvinceIdOrRegencyId(
            c,
            provinceId,
            regencyId
          )
          return Number(getEntityId?.global_id) === Number(health_center_id)
        }

        if (paramRegencyId) {
          const provinceId = await this.getProvinceIdByRegencyId(
            c,
            Number(paramRegencyId)
          )
          return Number(provinceId) === Number(entity.province_id)
        }

        return Number(province_id) === Number(entity.province_id)

      case ENTITY_TAG.CITY_DISTRICT_HEALTH_OFFICE:
        if (health_center_id) {
          const getEntityId = await this.getEntityIdByProvinceIdOrRegencyId(
            c,
            provinceId,
            regencyId
          )
          return Number(getEntityId?.global_id) === Number(health_center_id)
        }
        return Number(paramRegencyId) === Number(entity.regency_id)

      default:
        if (health_center_id)
          return Number(health_center_id) === Number(entity.global_id)

        return true
    }
  }

  async checkEntityIdChild(
    c: Context,
    programId: number,
    notificationId: number
  ) {
    const userEntityId = c.var.user.entity_id as number
    const userId = c.var.user.id

    const entity = await this.getUserEntityAttributes(c)

    if (!entity) return undefined

    let query = db.selectFrom("notifications").select(["id"])

    query = this.applyNotificationScope({
      query,
      entity,
      userEntityId,
      userId,
    })

    return query
      .where("id", "=", notificationId)
      .where("program_id", "=", programId)
      .executeTakeFirst()
  }
}
