import {
  QueryParamSchema,
  stringDate,
} from "@/common/schemas/query-param.schema.js"
import z from "zod"

const preprocessNumberArray = (val: any) => {
  if (typeof val === "string") {
    // Handle string: "1" atau "1,2,3"
    return val
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v))
  }
  if (Array.isArray(val)) {
    // Handle array: ["1", "2"] atau [1, 2]
    return val
      .map((v) => (typeof v === "string" ? Number(v) : v))
      .filter((v) => !isNaN(v))
  }
  if (typeof val === "number") {
    // Handle single number: 1
    return [val]
  }
    return val
}

const preprocessCceQueryParams = (val: any) => {
  return val
}

export const CceQueryParamsSchema = z.preprocess(
  preprocessCceQueryParams,
  z.object({
    year: z.union([z.string(), z.number()]).transform((v) => String(v)),
    month: z.union([z.string(), z.number()]).transform((v) => String(v)),
    entity_ids: z.preprocess(
      preprocessNumberArray,
      z.array(z.number()).optional()
    ),
    entity_tag_ids: z.preprocess(
      preprocessNumberArray,
      z.array(z.number()).optional()
    ),
    is_who_pqs: z.preprocess((val) => {
      if (typeof val === "string") {
        return val.toLowerCase() === "true"
      }
      return val
    }, z.boolean().optional()),
    province_ids: z.preprocess(
      preprocessNumberArray,
      z.array(z.number()).optional()
    ),
    regency_ids: z.preprocess(
      preprocessNumberArray,
      z.array(z.number()).optional()
    ),
    program_ids: z.preprocess(
      preprocessNumberArray,
      z.array(z.number()).optional()
    ),
  })
)

export type CceQueryParams = z.infer<typeof CceQueryParamsSchema>
