import z from "zod"

const preprocessNumberArray = (val: any) => {
  if (typeof val === "string") {
    if (!val.trim()) return undefined
    return val
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v))
      .filter((v) => !isNaN(v))
  }
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === "string" ? Number(v) : v))
      .filter((v) => !isNaN(v))
  }
  if (typeof val === "number") {
    return [val]
  }
  return val
}

export const AnnualQueryParamsSchema = z.object({
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
  year: z.preprocess((val) => {
    if (typeof val === "string") return Number(val)
    return val
  }, z.number().optional()),
})

export type AnnualQueryParams = z.infer<typeof AnnualQueryParamsSchema>
