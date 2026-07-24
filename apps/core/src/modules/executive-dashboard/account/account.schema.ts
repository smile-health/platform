import { REGEX_PASS } from "@/common/constants/users"
import { stringDate } from "@/modules/user/user.schema"
import { PaginationQueriesSchema } from "@smile/lib/types/paginate"
import {
  containsOnlyUnderscoresPeriod,
  hasWhiteSpace,
  isDateMoreThanNow,
  isStringNumbers,
  transformStringNumbersToArrayNumbers,
} from "@smile/lib/utils"
import { conditionsMessage } from "@smile/lib/zod.js"
import z from "zod"

export const LoginSchema = z.object({
  username: z
    .string({ required_error: "Username field is required" })
    .min(4, "Invalid username or password")
    .superRefine((val, c) => {
      conditionsMessage(c, "Username field is required", val.length == 0)
    }),
  password: z
    .string({ required_error: "Password field is required" })
    .min(8, "Invalid username or password")
    .max(255, "Password provided exceeds the maximum length of 255 characters.")
    .superRefine((val, c) => {
      conditionsMessage(c, "Password field is required", val.length == 0)
    }),
  fcm_token: z.string().optional(),
  create: z.boolean().default(false),
})

export const UpdatePasswordSchema = z.object({
  password: z.string().min(4).max(255),
  new_password: z.string().min(4).max(255),
  password_confirmation: z.string().min(4).max(255),
})

export const generalScema = z.object({
  username: z
    .string()
    .min(3)
    .max(255)
    .superRefine((val, c) => {
      conditionsMessage(
        c,
        "validator.string",
        !containsOnlyUnderscoresPeriod(val) || !hasWhiteSpace(val)
      )
    }),
  password: z
    .string()
    .min(8)
    .max(255)
    .superRefine((val, c) => {
      conditionsMessage(
        c,
        "validator.password",
        val.length < 8 || !REGEX_PASS.test(val)
      )
    })
    .nullish()
    .optional(),
  role: z.number(),
  firstname: z.string().min(3).max(255),
  lastname: z.string().min(3).max(255).nullish().optional(),
  email: z
    .string()
    .min(1)
    .max(255)
    .superRefine((val, c) => {
      conditionsMessage(
        c,
        "validator.email",
        !RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).exec(val.trim())
      )
    }),
  gender: z.number().min(1).max(2),
  mobile_phone: z
    .string()
    .min(8)
    .max(20)
    .superRefine((val, c) => {
      conditionsMessage(
        c,
        "validator.string",
        !RegExp(/^\+[1-9]\d{1,14}$/).exec(val)
      )
    })
    .nullish()
    .optional(),
  daily_recap_email: z.literal(0).or(z.literal(1)).nullish(),
  date_of_birth: stringDate()
    .optional()
    .superRefine((val, c) => {
      if (val) {
        conditionsMessage(c, "validator.string", isDateMoreThanNow(val))
      }
    })
    .nullish(),
  external_roles: z.array(z.string()).nullish(),
  address: z.string().nullish(),
  village_id: z.number().nullish(),
  entity_id: z.number().nullish(),
  token_login: z.string().nullish(),
  view_only: z.number().optional().default(0),
  manufacture_id: z.number().nullish(),
  timezone_id: z.number().nullish(),
  created_by: z.number().nullish(),
  updated_by: z.number().nullish(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  integration_client_id: z.number().optional(),
  external_properties: z.record(z.any()).optional(),
  program_ids: z.array(z.number()).optional(),
})

export const CreateUserSchema = generalScema
export const UpdateUserSchema = generalScema

export const listQuerySchema = PaginationQueriesSchema.extend({
  keyword: z.string().max(255).optional(),
  role: z.string().optional(),
  program_ids: z
    .string()
    .nullish()
    .refine((val) => !val || isStringNumbers(val))
    .transform((val) =>
      val ? transformStringNumbersToArrayNumbers(val) : null
    ),
  status: z
    .string()
    .nullish()
    .refine((val) => {
      return !val || ["0", "1"].includes(val)
    })
    .transform((val) => (val ? Number(val) : null)),
  start_date: stringDate().optional(),
  end_date: stringDate().optional(),
  sort_by: z.string().optional(),
  sort_type: z.string().optional(),
})

export const UpdateStatusSchema = z.object({
  status: z.boolean(),
})

export type LoginRequest = z.infer<typeof LoginSchema>
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>
export type ListQuery = z.infer<typeof listQuerySchema>
export type UpdateStatusRequest = z.infer<typeof UpdateStatusSchema>
export type CreateUserRequest = z.infer<typeof CreateUserSchema>
