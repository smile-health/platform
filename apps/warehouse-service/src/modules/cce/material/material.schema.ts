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

export const MaterialQueryParamsSchema = z.object({
  year: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val)
      return val
    },
    z.number({ required_error: "Year is required" })
  ),
  month: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val)
      return val
    },
    z.number({ required_error: "Month is required" })
  ),
  is_pqs: z.preprocess(
    (val) => {
      if (typeof val === "string") return Number(val)
      return val
    },
    z.number({ required_error: "PQS is required" })
  ),
  province_ids: z.preprocess(
    preprocessNumberArray,
    z.array(z.number()).optional()
  ),
  regency_ids: z.preprocess(
    preprocessNumberArray,
    z.array(z.number()).optional()
  ),
  entity_ids: z.preprocess(
    preprocessNumberArray,
    z.array(z.number()).optional()
  ),
  entity_tag_ids: z.preprocess(
    preprocessNumberArray,
    z.array(z.number()).optional()
  ),
  program_ids: z.preprocess(
    preprocessNumberArray,
    z.array(z.number()).optional()
  ),
})

export type MaterialQueryParams = z.infer<typeof MaterialQueryParamsSchema>
