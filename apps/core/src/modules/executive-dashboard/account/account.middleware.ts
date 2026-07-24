import z from "zod"
import { Context } from "hono"
import { BaseMiddleware } from "@smile-health/lib/base/middleware"
import {
  CreateUserSchema,
  listQuerySchema,
  UpdatePasswordSchema,
  UpdateUserSchema,
} from "./account.schema"
import { REGEX_PASS } from "@/common/constants/users"
import { ExecutiveRoleRepository } from "../role/role.repository"
import { ExecutiveUserRepository } from "../user/executive-user.repository"
import { ExecutiveWorkspaceRepository } from "../workspace/workspace.repository"
import { EntityRepository } from "@/modules/entity/entity.repository"

export class ExecutiveAccountMiddleware extends BaseMiddleware {
  constructor(
    private readonly executiveRoleRepo: ExecutiveRoleRepository,
    private readonly executiveUserRepo: ExecutiveUserRepository,
    private readonly executiveWorkspaceRepo: ExecutiveWorkspaceRepository,
    private readonly entityRepo: EntityRepository
  ) {
    super()
  }

  updatePassword = (c: Context) => {
    return UpdatePasswordSchema.superRefine((data, ctx) => {
      if (!REGEX_PASS.test(data.new_password) || data.new_password.length < 8) {
        ctx.addIssue({
          path: ["new_password"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.password", {
            field: c.var.t("account.label.new_password"),
          }),
        })
      }
      if (
        !REGEX_PASS.test(data.password_confirmation) ||
        data.password_confirmation.length < 8
      ) {
        ctx.addIssue({
          path: ["password_confirmation"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.password", {
            field: c.var.t("account.label.password_confirmation"),
          }),
        })
      }
      if (data.new_password !== data.password_confirmation) {
        ctx.addIssue({
          path: ["password_confirmation"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("account.label.update_password_unmatch", {
            new_password: c.var.t("account.label.new_password"),
            password_confirmation: c.var.t(
              "account.label.password_confirmation"
            ),
          }),
        })
      }
    })
  }

  updateProfile = (c: Context) => {
    const id = c.var.accountID
    return UpdateUserSchema.extend({
      role: z.number().optional(),
      username: z.string().optional(),
    }).superRefine(async (data, ctx) => {
      const user = await this.executiveUserRepo.findOne(c, { id: Number(id) })

      if (!user) {
        return ctx.addIssue({
          path: ["id"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "id" }),
        })
      }
      const [role, userUsernameExist, userEmailExist] = await Promise.all([
        this.executiveRoleRepo.findOne(c, { id: data.role ?? -1 }),
        this.executiveUserRepo.findUsernameExceptId(
          c,
          data.username ?? "",
          Number(id)
        ),
        this.executiveUserRepo.findEmailExceptId(c, data.email, Number(id)),
      ])

      if (!role && typeof data.role === "number") {
        ctx.addIssue({
          path: ["role"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "role" }),
        })
      }
      if (userUsernameExist) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.exist", { field: "username" }),
        })
      }
      if (userEmailExist) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.exist", { field: "email" }),
        })
      }
    })
  }

  updateUser = (c: Context) => {
    const id = c.req.param("id")
    return UpdateUserSchema.superRefine(async (data, ctx) => {
      const programIds = data.program_ids?.length ? data.program_ids : [-1]
      const user = await this.executiveUserRepo.findOne(c, { id: Number(id) })

      if (!user) {
        return ctx.addIssue({
          path: ["id"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "id" }),
        })
      }

      const [workspaces, role, userUsernameExist, userEmailExist] =
        await Promise.all([
          this.executiveWorkspaceRepo.find(c, {
            id: programIds,
          }),
          this.executiveRoleRepo.findOne(c, { id: data.role }),
          this.executiveUserRepo.findUsernameExceptId(
            c,
            data.username,
            Number(id)
          ),
          this.executiveUserRepo.findEmailExceptId(c, data.email, Number(id)),
        ])

      if (userUsernameExist) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.exist", { field: "username" }),
        })
      }

      if (userEmailExist) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.exist", { field: "email" }),
        })
      }

      if (!data.program_ids || data.program_ids.length === 0) {
        ctx.addIssue({
          path: ["program_ids"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_empty", { field: "program_ids" }),
        })
      }
      if (data.program_ids && workspaces.length !== data.program_ids.length) {
        ctx.addIssue({
          path: ["program_ids"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "program_ids" }),
        })
      }
      if (!role) {
        ctx.addIssue({
          path: ["role"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "role" }),
        })
      }
    })
  }

  list = (c: Context) => {
    return listQuerySchema.superRefine(async (data, ctx) => {
      const { sort_by, sort_type } = data
      const sortBys = ["fullname", "role_label", "username"]
      const sortTypes = ["asc", "desc"]

      if (sort_by && !sortBys.includes(sort_by)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sort_by"],
          message: c.var.t("validator.one_of", {
            field: "sort_by",
            condition: sortBys,
          }),
        })
      }

      if (sort_type && !sortTypes.includes(sort_type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sort_type"],
          message: c.var.t("validator.one_of", {
            field: "sort_type",
            condition: sortTypes,
          }),
        })
      }

      if (!data.start_date && data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start_date"],
          message: c.var.t("validator.not_empty", {
            field: c.var.t("common.start_date"),
          }),
        })
      }

      if (data.start_date && !data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: c.var.t("validator.not_empty", {
            field: c.var.t("common.end_date"),
          }),
        })
      }

      if (data.start_date && data.end_date && data.start_date > data.end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: c.var.t("validator.end_date_before_start_date"),
        })
      }

      const [workspaces, role] = await Promise.all([
        this.executiveWorkspaceRepo.find(c, {
          id: data.program_ids,
        }),
        this.executiveRoleRepo.findOne(c, { id: data.role }),
      ])

      if (data.program_ids && workspaces.length !== data.program_ids.length) {
        ctx.addIssue({
          path: ["program_ids"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "program_ids" }),
        })
      }
      if (data.role && !role) {
        ctx.addIssue({
          path: ["role"],
          code: z.ZodIssueCode.custom,
          message: c.var.t("validator.not_exist", { field: "role" }),
        })
      }
    })
  }

  checkUserExist = (c: Context) => {
    return z
      .object({
        id: z.string(),
      })
      .superRefine(async (data, ctx) => {
        if (!data.id || isNaN(Number(data.id))) {
          ctx.addIssue({
            path: ["id"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.number", { field: "id" }),
          })
        }
        const user = await this.executiveUserRepo.findOne(c, { id: data.id })
        if (!user) {
          ctx.addIssue({
            path: ["id"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.not_exist", { field: "id" }),
          })
        }
      })
  }

  #getEntityExecutive = async (c: Context) => {
    const entity = await this.entityRepo.findOne(c, { code: "executive" })
    if (!entity) {
      const entityCreate = await this.entityRepo.create(c, {
        code: "executive",
        name: "Executive",
        type: 0,
      })
      return Number(entityCreate.insertId)
    }
    return entity?.id
  }

  create = (c: Context) => {
    return CreateUserSchema.omit({ password: true })
      .extend({
        password: z.string().min(8).max(255),
      })
      .superRefine(async (data, ctx) => {
        const programIds = data.program_ids?.length ? data.program_ids : [-1]
        const [workspaces, role, userUsernameEmailExist, entityId] =
          await Promise.all([
            this.executiveWorkspaceRepo.find(c, {
              id: programIds,
            }),
            this.executiveRoleRepo.findOne(c, { id: data.role }),
            this.executiveUserRepo.checkUsernameEmail(
              c,
              data.username,
              data.email,
              true
            ),
            this.#getEntityExecutive(c),
          ])
        if (
          Array.isArray(userUsernameEmailExist) &&
          userUsernameEmailExist.some((item) => item.email === data.email)
        ) {
          ctx.addIssue({
            path: ["email"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.exist", { field: "email" }),
          })
        }
        if (
          Array.isArray(userUsernameEmailExist) &&
          userUsernameEmailExist.some((item) => item.username === data.username)
        ) {
          ctx.addIssue({
            path: ["username"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.exist", { field: "username" }),
          })
        }

        if (!REGEX_PASS.test(data.password) || data.password.length < 8) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.password", {
              field: c.var.t("account.label.password"),
            }),
          })
        }

        if (!data.program_ids || data.program_ids.length === 0) {
          ctx.addIssue({
            path: ["program_ids"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.not_empty", { field: "program_ids" }),
          })
        }
        if (data.program_ids && workspaces.length !== data.program_ids.length) {
          ctx.addIssue({
            path: ["program_ids"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.not_exist", { field: "program_ids" }),
          })
        }
        if (!role) {
          ctx.addIssue({
            path: ["role"],
            code: z.ZodIssueCode.custom,
            message: c.var.t("validator.not_exist", { field: "role" }),
          })
        }
        data.entity_id = entityId
      })
  }
}
