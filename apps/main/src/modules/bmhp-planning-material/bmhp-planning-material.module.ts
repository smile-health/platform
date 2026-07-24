import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import {
  BmhpMaterialDetailRepository,
  BmhpMaterialRepository,
} from "./bmhp-planning-material.repository.js"
import {
  CreateBmhpMaterialDetailRequest,
  CreateBmhpMaterialRequest,
  CreateProductVariantRequest,
  GetBmhpPlanningMaterialsQueries,
  GetMaterialQueries,
  GetProductVariantQueries,
  GetVariantRequest,
  UpdateBmhpMaterialRequest,
  UpdateBmhpMaterialStatusRequest,
  UpdateProductVariantRequest,
} from "./bmhp-planning-material.schema.js"

export class BmhpPlanningMaterialModule {
  constructor(
    private readonly bmhpMaterialRepo: BmhpMaterialRepository,
    private readonly bmhpMaterialDetailRepo: BmhpMaterialDetailRepository
  ) {}

  // ==================== BMHP Material CRUD ====================

  async list(c: Context, query: GetBmhpPlanningMaterialsQueries) {
    const { list, total } = await this.bmhpMaterialRepo.findWithPagination(
      c,
      query
    )
    const formattedList = list.map((item) => {
      const row = item as Record<string, unknown>
      const {
        id_updated,
        username_updated,
        firstname_updated,
        lastname_updated,
        id_created,
        username_created,
        firstname_created,
        lastname_created,
        ...rest
      } = row
      return {
        ...rest,
        user_updated_by: id_updated
          ? {
              id: id_updated,
              username: username_updated,
              firstname: firstname_updated,
              lastname: lastname_updated,
            }
          : null,
        user_created_by: id_created
          ? {
              id: id_created,
              username: username_created,
              firstname: firstname_created,
              lastname: lastname_created,
            }
          : null,
      }
    })
    return new PaginatedResponse(query, formattedList, total)
  }

  async listMaterial(c: Context, query: GetMaterialQueries) {
    const { data, total } =
      await this.bmhpMaterialRepo.findMaterialsWithPagination(c, query)
    return new PaginatedResponse(query, data, total)
  }

  async detail(c: Context, id: number) {
    const bmhpMaterial = await this.bmhpMaterialRepo.findDetailById(c, id)
    if (!bmhpMaterial) {
      throw new NotFoundError("BMHP Material not found")
    }

    // Get material_ids from ws_bmhp_material_details
    const bmhpMaterialDetails =
      await this.bmhpMaterialDetailRepo.findByBmhpMaterialId(c, id)

    const materialIds = bmhpMaterialDetails.map((d) => d.material_id)

    // Get material_details from ws_bmhp_material_variant by material_ids
    const material_details =
      materialIds.length > 0
        ? await this.bmhpMaterialRepo.findMaterialVariantsByMaterialIds(
            c,
            materialIds
          )
        : []

    // Get material_variant_details from ws_bmhp_material_variant_detail by variant ids
    const variantIds = material_details.map((d) => Number(d.id))
    const material_variant_details =
      variantIds.length > 0
        ? await this.bmhpMaterialRepo.findVariantDetailsByVariantId(
            c,
            variantIds
          )
        : []

    const bmhpMaterialRow = bmhpMaterial as Record<string, unknown>
    const {
      id_updated,
      username_updated,
      firstname_updated,
      lastname_updated,
      updated_by,
      id_created,
      username_created,
      firstname_created,
      lastname_created,
      created_by,
      ...rest
    } = bmhpMaterialRow

    return {
      id: rest.id,
      name: rest.name,
      is_reagen: rest.is_reagen,
      is_active: rest.is_active,
      created_at: rest.created_at,
      updated_at: rest.updated_at,
      material_details,
      material_variant_details,
      created_by: id_created
        ? [firstname_created, lastname_created].filter(Boolean).join(" ") ||
          username_created
        : null,
      updated_by: id_updated
        ? [firstname_updated, lastname_updated].filter(Boolean).join(" ") ||
          username_updated
        : null,
    }
  }

  async create(c: Context, request: CreateBmhpMaterialRequest) {
    // Check if name already exists
    const existing = await this.bmhpMaterialRepo.findOne(c, {
      name: request.name,
    })
    if (existing) {
      throw new ValidationError("BMHP Material with this name already exists")
    }

    // Extract material arrays from request
    const { material_details, material_variant_details, ...materialData } =
      request
    const data = pick(materialData, [
      "name",
      "is_reagen",
      "description",
      "is_active",
      "program_plan_id",
    ])

    // Create BMHP Material
    const result = await this.bmhpMaterialRepo.create(c, data)
    const bmhpMaterialId = Number(result.insertId)

    // Insert material_details
    if (material_details && material_details.length > 0) {
      const detailData = material_details.map((detail) => ({
        bmhp_material_id: bmhpMaterialId,
        material_id: detail.material_id,
        material_level_id: detail.material_level_id,
        test_qty_per_package: detail.qty,
      }))
      await this.bmhpMaterialDetailRepo.createMany(c, detailData)
    }

    return this.detail(c, bmhpMaterialId)
  }

  async update(c: Context, id: number, request: UpdateBmhpMaterialRequest) {
    const existing = await this.bmhpMaterialRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Material not found")
    }

    // Check if name already exists (excluding current record)
    if (request.name && request.name !== existing.name) {
      const duplicate = await this.bmhpMaterialRepo.findOne(c, {
        name: request.name,
      })
      if (duplicate) {
        throw new ValidationError("BMHP Material with this name already exists")
      }
    }

    // Extract material arrays from request
    const { material_details, material_variant_details, ...materialData } =
      request

    // Update BMHP Material
    const data = pick(materialData, [
      "name",
      "is_reagen",
      "description",
      "is_active",
      "program_plan_id",
    ])
    await this.bmhpMaterialRepo.update(c, data, { id })

    // Handle material details update (delete-and-reinsert strategy)
    if (
      material_details !== undefined ||
      material_variant_details !== undefined
    ) {
      // Delete existing material details
      await this.bmhpMaterialDetailRepo.deleteByBmhpMaterialId(c, id)

      // Re-insert material_details
      if (material_details && material_details.length > 0) {
        const detailData = material_details.map((detail) => ({
          bmhp_material_id: id,
          material_id: detail.material_id,
          material_level_id: detail.material_level_id,
          test_qty_per_package: detail.qty,
        }))

        await this.bmhpMaterialDetailRepo.createMany(c, detailData)
      }
    }

    return this.detail(c, id)
  }

  async updateStatus(
    c: Context,
    id: number,
    request: UpdateBmhpMaterialStatusRequest
  ) {
    const existing = await this.bmhpMaterialRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Material not found")
    }

    await this.bmhpMaterialRepo.update(
      c,
      { is_active: request.is_active },
      { id }
    )

    return this.detail(c, id)
  }

  async delete(c: Context, id: number) {
    const existing = await this.bmhpMaterialRepo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Material not found")
    }

    const isUsed = await this.bmhpMaterialRepo.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.bmhpMaterialRepo.delete(c, { id })

    // Also delete related material details
    await this.bmhpMaterialDetailRepo.deleteByBmhpMaterialId(c, id)

    return { message: "BMHP Material deleted successfully" }
  }

  async getVariant(c: Context, params: GetVariantRequest) {
    const isMaterialVariant = params.type == 2

    const { data, total } = isMaterialVariant
      ? await this.bmhpMaterialRepo.findMaterialVariants(c, params)
      : await this.bmhpMaterialRepo.findVariants(c, params)

    const result = data.map((item) => {
      const baseData = {
        id: item.global_id,
        name: item.name,
        qty: item.qty,
        parent_id: item.parent_global_id,
        material_level_id: item.material_level_id,
        unit_id: item.unit_id,
        unit_name: c.var.t(`material_unit.label.${item.unit_name}`),
        unit_of_consumption_id: item.unit_of_consumption_id,
        unit_of_consumption_name: item.unit_of_consumption_name
          ? c.var.t(`material_unit.label.${item.unit_of_consumption_name}`)
          : null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        updated_by: item.updated_by,
      }

      return baseData
    })

    return new PaginatedResponse(params, result, total)
  }

  async listProductVariant(c: Context, query: GetProductVariantQueries) {
    const { data, total } =
      await this.bmhpMaterialRepo.findVariantsWithPagination(c, query)
    const formattedList = data.map((item) => {
      const row = item as Record<string, unknown>
      const {
        id_updated,
        username_updated,
        firstname_updated,
        lastname_updated,
        id_created,
        username_created,
        firstname_created,
        lastname_created,
        ...rest
      } = row
      return {
        ...rest,
        user_updated_by: id_updated
          ? {
              id: id_updated,
              username: username_updated,
              firstname: firstname_updated,
              lastname: lastname_updated,
            }
          : null,
        user_created_by: id_created
          ? {
              id: id_created,
              username: username_created,
              firstname: firstname_created,
              lastname: lastname_created,
            }
          : null,
      }
    })
    return new PaginatedResponse(query, formattedList, total)
  }

  async createProductVariant(c: Context, request: CreateProductVariantRequest) {
    const variantId = await this.bmhpMaterialRepo.createVariant(c, {
      material_id: request.material_id,
      is_variant: request.is_variant,
      program_plan_id: request.program_plan_id,
    })

    const detailData = request.variants.map((variant) => ({
      material_variant_id: variantId,
      material_id: variant.material_id,
      name: variant.name,
      test_qty: variant.test_qty,
      unit_id: variant.unit_id,
    }))

    await this.bmhpMaterialRepo.createVariantDetails(c, detailData)

    return []
  }

  async detailProductVariant(c: Context, id: number) {
    const variant = await this.bmhpMaterialRepo.findVariantById(c, id)
    if (!variant) {
      throw new NotFoundError("Product variant not found")
    }

    const details = await this.bmhpMaterialRepo.findVariantDetailsByVariantId(
      c,
      id
    )

    const variantRow = variant as Record<string, unknown>
    const {
      id_updated,
      username_updated,
      firstname_updated,
      lastname_updated,
      updated_by,
      id_created,
      username_created,
      firstname_created,
      lastname_created,
      ...rest
    } = variantRow

    const localizedDetails = details.map((detail) => ({
      ...detail,
      unit_name: c.var.t(`material_unit.label.${detail.unit_name}`),
      distribution_unit_name: detail.distribution_unit_name
        ? c.var.t(`material_unit.label.${detail.distribution_unit_name}`)
        : null,
    }))

    return {
      ...rest,
      variants: localizedDetails,
      created_by: id_created
        ? [firstname_created, lastname_created].filter(Boolean).join(" ") ||
          username_created
        : null,
      updated_by: id_updated
        ? [firstname_updated, lastname_updated].filter(Boolean).join(" ") ||
          username_updated
        : null,
    }
  }

  async updateProductVariant(
    c: Context,
    id: number,
    request: UpdateProductVariantRequest
  ) {
    const existing = await this.bmhpMaterialRepo.findVariantById(c, id)
    if (!existing) {
      throw new NotFoundError("Product variant not found")
    }

    if (request.material_id) {
      await this.bmhpMaterialRepo.updateVariant(c, id, {
        material_id: request.material_id,
        is_variant: request.is_variant,
        program_plan_id: request.program_plan_id,
      })
    }

    if (request.variants) {
      await this.bmhpMaterialRepo.deleteVariantDetailsByVariantId(c, id)

      const detailData = request.variants.map((variant) => ({
        material_variant_id: id,
        material_id: variant.material_id,
        name: variant.name,
        test_qty: variant.test_qty,
        unit_id: variant.unit_id,
      }))

      await this.bmhpMaterialRepo.createVariantDetails(c, detailData)
    }

    return this.detailProductVariant(c, id)
  }

  async deleteProductVariant(c: Context, id: number) {
    const existing = await this.bmhpMaterialRepo.findVariantById(c, id)
    if (!existing) {
      throw new NotFoundError("Product variant not found")
    }

    const isUsed = await this.bmhpMaterialRepo.checkVariantUsage(c, existing.material_id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.bmhpMaterialRepo.deleteVariant(c, id)
    await this.bmhpMaterialRepo.deleteVariantDetailsByVariantId(c, id)

    return { message: "Product variant deleted successfully" }
  }

  async addMaterialDetail(
    c: Context,
    bmhpMaterialId: number,
    request: CreateBmhpMaterialDetailRequest
  ) {
    // Check if BMHP material exists
    const bmhpMaterial = await this.bmhpMaterialRepo.findOne(c, {
      id: bmhpMaterialId,
    })
    if (!bmhpMaterial) {
      throw new NotFoundError("BMHP Material not found")
    }

    // Check if material detail already exists
    const existing =
      await this.bmhpMaterialDetailRepo.findOneByBmhpMaterialIdAndMaterialId(
        c,
        bmhpMaterialId,
        request.material_id
      )
    if (existing) {
      throw new ValidationError(
        "Material detail already exists for this BMHP Material"
      )
    }

    const data = {
      bmhp_material_id: bmhpMaterialId,
      material_id: request.material_id,
    }

    await this.bmhpMaterialDetailRepo.create(c, data)

    return this.detail(c, bmhpMaterialId)
  }

  async removeMaterialDetail(
    c: Context,
    bmhpMaterialId: number,
    materialId: number
  ) {
    // Check if BMHP material exists
    const bmhpMaterial = await this.bmhpMaterialRepo.findOne(c, {
      id: bmhpMaterialId,
    })
    if (!bmhpMaterial) {
      throw new NotFoundError("BMHP Material not found")
    }

    // Check if material detail exists
    const existing =
      await this.bmhpMaterialDetailRepo.findOneByBmhpMaterialIdAndMaterialId(
        c,
        bmhpMaterialId,
        materialId
      )
    if (!existing) {
      throw new NotFoundError("Material detail not found")
    }

    await this.bmhpMaterialDetailRepo.delete(c, {
      bmhp_material_id: bmhpMaterialId,
      material_id: materialId,
    })

    return { message: "Material detail removed successfully" }
  }

  async listMaterialDetails(c: Context, bmhpMaterialId: number) {
    // Check if BMHP material exists
    const bmhpMaterial = await this.bmhpMaterialRepo.findOne(c, {
      id: bmhpMaterialId,
    })
    if (!bmhpMaterial) {
      throw new NotFoundError("BMHP Material not found")
    }

    return await this.bmhpMaterialDetailRepo.findByBmhpMaterialId(
      c,
      bmhpMaterialId
    )
  }
}
