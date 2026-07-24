import { z } from "zod"

const datetimeFormatRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/

const optionalDateSchema = z
  .string()
  .date()
  .optional()
  .transform((date) => (date ? new Date(date) : null))

export const CreateStockOpnamePeriodRequest = z
  .object({
    start_date: z.string().date(),
    end_date: z.string().date(),
    month_period: z.number().int().min(1).max(12),
    year_period: z.number().int().min(2000),
    status: z.number().int().optional(),
    cutoff_date: z.string(),
  })
  .superRefine((val, c) => {
    if (new Date(val.start_date) > new Date(val.end_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.end_date_before_start_date",
        path: ["end_date"],
      })
    }
    if (!datetimeFormatRegex.test(val.cutoff_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_format",
        path: ["cutoff_date"],
      })
      return
    }
    const cutoffDate = new Date(val.cutoff_date.replace(" ", "T"))
    if (cutoffDate > new Date(val.end_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_after_end_date",
        path: ["cutoff_date"],
      })
    }
    if (cutoffDate < new Date(val.start_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_before_start_date",
        path: ["cutoff_date"],
      })
    }
  })

export const UpdateStockOpnamePeriodRequest = z
  .object({
    start_date: z.string().date(),
    end_date: z.string().date(),
    cutoff_date: z.string(),
    month_period: z.number().int().min(1).max(12),
    year_period: z.number().int().min(2000),
    status: z.number().int().optional(),
  })
  .superRefine((val, c) => {
    if (new Date(val.start_date) > new Date(val.end_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.end_date_before_start_date",
        path: ["end_date"],
      })
    }
    if (!datetimeFormatRegex.test(val.cutoff_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_format",
        path: ["cutoff_date"],
      })
      return
    }
    const cutoffDate = new Date(val.cutoff_date.replace(" ", "T"))
    if (cutoffDate > new Date(val.end_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_after_end_date",
        path: ["cutoff_date"],
      })
    }
    if (cutoffDate < new Date(val.start_date)) {
      c.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validator.cutoff_date_before_start_date",
        path: ["cutoff_date"],
      })
    }
  })

export const UpdateStockOpnamePeriodStatusRequest = z.object({
  status: z.number().int(),
})

export const GetStockOpnamePeriodsQueries = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    paginate: z.coerce.number().int().min(1).optional(),
    offset: z.coerce.number().int().min(0).default(0),
    status: z.coerce.number().int().optional(),
    year_period: z.coerce.number().int().optional(),
    month_period: z.coerce.number().int().optional(),
    start_date: optionalDateSchema,
    end_date: optionalDateSchema,
  })
  .superRefine((val, c) => {
    if (val.start_date && val.end_date) {
      if (val.start_date > val.end_date) {
        c.addIssue({
          code: z.ZodIssueCode.custom,
          message: "validator.end_date_before_start_date",
          path: ["end_date"],
        })
      }
    }
  })

export const UserBasicDetail = z
  .object({
    id: z.number(),
    username: z.string(),
    firstname: z.string().nullable(),
    lastname: z.string().nullable(),
    fullname: z.string(),
  })
  .nullable()
