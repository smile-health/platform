import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { Context } from "hono"
import { z } from "zod"
import { NotificationRepository } from "./notification.repository.js"
import {
  GetNotificationsQueryParamsSchema,
  GetNotificationsQueryParams,
  GetNotificationParamSchema,
} from "./notification.schema.js"
import { StatusCodes } from "http-status-codes"
import { USER_ROLE } from "@/common/constants/users.js"

export class NotificationMiddleware extends BaseMiddleware {
  constructor(private readonly repository: NotificationRepository) {
    super()
  }

  readonly #getlocation = async (c: Context, id: number, level: number) => {
    const location = await this.repository.getLocationById(c, Number(id), level)
    return location
  }

  readonly #getEntityTags = async (c: Context, ids: number[]) => {
    const entityTags = await this.repository.getEntityTagByIds(c, ids)
    return entityTags
  }

  readonly #getPrograms = async (c: Context, ids: number[]) => {
    const programs = await this.repository.getProgramByIds(c, ids)
    return programs
  }

  readonly #getEntity = async (c: Context, id: number) => {
    const entity = await this.repository.getEntityById(c, Number(id))
    return entity
  }

  readonly #getNotification = async (id: number) => {
    const notification = await this.repository.getNotificationById(id)
    return notification
  }

  readonly #locationIdNotExist = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    if (data.province_id) {
      const province = await this.#getlocation(c, data.province_id, 0)
      if (!province) {
        ctx.addIssue({
          path: ["province_id"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_exist",
        })
      }
    }

    if (data.city_id) {
      const city = await this.#getlocation(c, data.city_id, 1)
      if (!city) {
        ctx.addIssue({
          path: ["city_id"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_exist",
        })
      }
    }
  }

  readonly #entityIsMatch = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    const userRole = c.var.user.role
    if ([USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(Number(userRole)))
      return
    if (!data.province_id && !data.city_id && !data.health_center_id) return

    const isMatch = await this.repository.checkEntityIsMatch(c, data)
    if (!isMatch) {
      ctx.addIssue({
        path: ["province_id", "city_id", "health_center_id"],
        code: z.ZodIssueCode.custom,
        message: "validator.not_authorized",
      })
    }
  }

  readonly #userProgramIsAssigned = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    const isMatch = await this.repository.checkUserProgramIsAssigned(c, data)
    if (!isMatch) {
      ctx.addIssue({
        path: ["program_ids"],
        code: z.ZodIssueCode.custom,
        message: "validator.not_authorized",
      })
    }
  }

  readonly #entityTagIdsNotExist = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    if (data.entity_tag_ids) {
      const entityTags = await this.#getEntityTags(c, data.entity_tag_ids)
      if (data.entity_tag_ids.length !== entityTags.length) {
        ctx.addIssue({
          path: ["entity_tag_ids"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_exist",
        })
      }
    }
  }

  readonly #programIdsNotExist = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    if (data.program_ids && data.program_ids.length > 0) {
      const programs = await this.#getPrograms(c, data.program_ids)
      if (data.program_ids.length !== programs.length) {
        ctx.addIssue({
          path: ["program_ids"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_exist",
        })
        return
      }
    }
  }

  readonly #healthCenterIdNotExist = async (
    c: Context,
    ctx: z.RefinementCtx,
    data: Partial<GetNotificationsQueryParams>
  ) => {
    if (data.health_center_id) {
      const healthCenter = await this.#getEntity(c, data.health_center_id)
      if (!healthCenter) {
        ctx.addIssue({
          path: ["health_center_id"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_exist",
        })
      }
    }
  }

  readonly #updateSingleReadCheck = async (
    c: Context,
    ctx: z.RefinementCtx,
    id: number
  ) => {
    const userRole = c.var.user.role
    const programId = c?.req?.header("x-program-id")

    const notification = await this.#getNotification(id)

    if (!notification) {
      ctx.addIssue({
        path: ["id"],
        code: z.ZodIssueCode.custom,
        message: "validator.not_exist",
      })
    }

    if (![USER_ROLE.SUPERADMIN, USER_ROLE.ADMIN].includes(Number(userRole))) {
      await this.#programIdsNotExist(c, ctx, {
        program_ids: programId ? [Number(programId)] : undefined,
      })

      if (!notification) {
        ctx.addIssue({
          path: ["id"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_authorized",
        })
        return
      }

      const entityIdChild = await this.repository.checkEntityIdChild(
        c,
        Number(programId),
        id
      )
      if (!entityIdChild) {
        ctx.addIssue({
          path: ["id"],
          code: z.ZodIssueCode.custom,
          message: "validator.not_authorized",
        })
        return
      }
    }

    if (notification?.read_at) {
      ctx.addIssue({
        path: ["id"],
        code: z.ZodIssueCode.custom,
        message: "validator.has_marked_as_read",
      })
    }
  }

  list = (c: Context) => {
    return GetNotificationsQueryParamsSchema.superRefine(async (data, ctx) => {
      await this.#locationIdNotExist(c, ctx, data)
      await this.#entityTagIdsNotExist(c, ctx, data)
      await this.#programIdsNotExist(c, ctx, data)
      await this.#userProgramIsAssigned(c, ctx, data)
      await this.#entityIsMatch(c, ctx, data)
      await this.#healthCenterIdNotExist(c, ctx, data)
    })
  }

  updateSingleRead = (c: Context) => {
    return GetNotificationParamSchema.superRefine(async (data, ctx) => {
      await this.#updateSingleReadCheck(c, ctx, data.id)
    })
  }

  isDisabledNotification = async (c, next) => {
    if (c.var.is_disabled_notification) {
      return c.json(undefined, StatusCodes.NO_CONTENT)
    }
    await next()
  }
}
