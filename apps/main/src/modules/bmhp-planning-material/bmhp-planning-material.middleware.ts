import { BaseMiddleware } from "@smile/lib/base/middleware.js"
import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { z } from "zod"
import { BmhpMaterialRepository } from "./bmhp-planning-material.repository.js"
import {
  CreateBmhpMaterialRequestSchema,
  CreateProductVariantRequestSchema,
  GetVariantRequestSchema,
  UpdateBmhpMaterialRequestSchema,
} from "./bmhp-planning-material.schema.js"

export class BmhpPlanningMaterialMiddleware extends BaseMiddleware {
  constructor(private readonly bmhpMaterialRepo: BmhpMaterialRepository) {
    super()
  }

  createBmhpMaterialSchema = (c: Context) => {
    return CreateBmhpMaterialRequestSchema.superRefine(async (data, ctx) => {
      // Check if name already exists within the same program plan
      const existing = await this.bmhpMaterialRepo.findOne(c, {
        name: data.name,
        program_plan_id: data.program_plan_id,
      })

      if (existing) {
        throw new ValidationError("BMHP Material with this name already exists")
      }
    })
  }

  updateBmhpMaterialSchema = (c: Context) => {
    return UpdateBmhpMaterialRequestSchema.superRefine(async (data, ctx) => {
      const id = Number(c.req.param("id"))

      // Check if material exists
      const existing = await this.bmhpMaterialRepo.findOne(c, { id })
      if (!existing) {
        throw new NotFoundError("BMHP Material not found")
      }

      // Check if name already exists within the same program plan (excluding current record)
      if (data.name && data.name !== (existing as any).name) {
        const duplicate = await this.bmhpMaterialRepo.findOne(c, {
          name: data.name,
          program_plan_id: data.program_plan_id ?? (existing as any).program_plan_id,
        })
        if (duplicate && (duplicate as any).id !== id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "BMHP Material with this name already exists",
            path: ["name"],
          })
        }
      }
    })
  }

  createProductVariantSchema = (c: Context) => {
    return CreateProductVariantRequestSchema.superRefine(async (data, ctx) => {
      const existing = await this.bmhpMaterialRepo.findVariantByMaterialAndProgramPlan(
        c,
        data.material_id,
        data.program_plan_id
      )
      if (existing) {
        throw new ValidationError("Data sudah ada")
      }
    })
  }

  getVariantSchema = (c: Context) => {
    return GetVariantRequestSchema
  }
}
