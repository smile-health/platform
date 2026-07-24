import z from "zod"
import {
  containsOnlyUnderscoresPeriod,
  hasWhiteSpace,
} from "@smile-health/lib/utils.js"
import { conditionsMessage } from "@smile-health/lib/zod.js"
import { stringMinMax } from "@/modules/user/user.schema"

export const UpdateLastLoginSchema = z.object({
  fcm_token: z.coerce.string().nullish(),
  last_device: z.coerce.string().nullish(),
  last_login: z.coerce
    .date()
    .refine((value) => value, { message: "validate.date" })
    .nullish(),
})

export type UpdateLastLoginRequest = z.infer<typeof UpdateLastLoginSchema>

export const ValidateUserExistsSchema = z.object({
  username: stringMinMax(3, 255).superRefine((val, c) => {
    conditionsMessage(
      c,
      "validator.string",
      !containsOnlyUnderscoresPeriod(val) || !hasWhiteSpace(val)
    )
  }),
})

export type ValidateUserExistsRequest = z.infer<typeof ValidateUserExistsSchema>
