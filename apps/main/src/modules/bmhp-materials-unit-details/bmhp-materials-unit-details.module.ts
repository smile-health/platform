import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { pick } from "@smile/lib/utils.js"
import { Context } from "hono"
import { BmhpMaterialsUnitDetailRepository } from "./bmhp-materials-unit-details.repository.js"
import {
  CalculateLabConsumptionRequest,
  CreateBmhpMaterialsUnitDetailRequest,
  GetBmhpMaterialsUnitDetailsQueries,
  GetVariantDetailsQueries,
  UpdateBmhpMaterialsUnitDetailRequest,
} from "./bmhp-materials-unit-details.schema.js"

export class BmhpMaterialsUnitDetailsModule {
  constructor(
    private readonly repo: BmhpMaterialsUnitDetailRepository
  ) {}

  async list(c: Context, query: GetBmhpMaterialsUnitDetailsQueries) {
    const { list, total } = await this.repo.findWithPagination(c, query)
    return new PaginatedResponse(query, list, total)
  }

  async detail(c: Context, id: number) {
    const result = await this.repo.findByIdWithDetails(c, id)

    if (!result) {
      throw new NotFoundError("BMHP Materials Unit Detail not found")
    }

    return result
  }

  async create(c: Context, request: CreateBmhpMaterialsUnitDetailRequest) {
    // Check if combination already exists
    const existing = await this.repo.findByParentAndChildMaterialId(
      c,
      request.bmhp_material_details_id,
      request.variant_material_id
    )
    if (existing) {
      throw new ValidationError(
        "BMHP Materials Unit Detail with this parent and child material combination already exists"
      )
    }

    const data = pick(request, [
      "bmhp_material_details_id",
      "variant_material_id",
      "qty_per_package",
      "test_qty_per_package",
      "consumption_per_test",
    ])

    const result = await this.repo.create(c, data)
    const id = Number(result.insertId)

    return this.repo.findByIdWithDetails(c, id)
  }

  async update(c: Context, id: number, request: UpdateBmhpMaterialsUnitDetailRequest) {
    const existing = await this.repo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Materials Unit Detail not found")
    }

    // Check if new combination already exists (excluding current record)
    const parentMaterialId = request.bmhp_material_details_id ?? existing.bmhp_material_details_id
    const childMaterialId = request.variant_material_id ?? existing.variant_material_id

    if (
      request.bmhp_material_details_id !== undefined ||
      request.variant_material_id !== undefined
    ) {
      const duplicate = await this.repo.findByParentAndChildMaterialId(
        c,
        parentMaterialId,
        childMaterialId
      )
      if (duplicate && duplicate.id !== id) {
        throw new ValidationError(
          "BMHP Materials Unit Detail with this parent and child material combination already exists"
        )
      }
    }

    const data = pick(request, [
      "bmhp_material_details_id",
      "variant_material_id",
      "qty_per_package",
      "test_qty_per_package",
      "consumption_per_test",
    ])

    await this.repo.update(c, data, { id })

    return this.repo.findByIdWithDetails(c, id)
  }

  async delete(c: Context, id: number) {
    const existing = await this.repo.findOne(c, { id })
    if (!existing) {
      throw new NotFoundError("BMHP Materials Unit Detail not found")
    }

    await this.repo.delete(c, { id })

    return { message: "BMHP Materials Unit Detail deleted successfully" }
  }

  async listByParentMaterialId(c: Context, parentMaterialId: number) {
    const result = await this.repo.findByParentMaterialId(c, parentMaterialId)

    return {
      data: result
    }
  }

  async listByChildMaterialId(c: Context, childMaterialId: number) {
    const result = await this.repo.findByChildMaterialId(c, childMaterialId)

    return {
      data: result
    }
  }

  async calculateLabConsumption(c: Context, request: CalculateLabConsumptionRequest) {
    const targetIds = request.target.map(t => t.id)
    const testQtyMap = new Map(request.target.map(t => [t.id, t.test_qty]))
    
    // Get target groups from repository
    const targetGroups = await this.repo.getTargetGroups(c, targetIds)
    
    // Build results with mapping in module
    const results = []

    for (const targetGroup of targetGroups) {
      // Get examination target materials scoped to the specific examination
      const examTargetMaterials = await this.repo.getExamTargetMaterials(c, request.examination_id, targetGroup.id)
      
      // Get packages with qty_per_package
      const packages = []
      for (const material of examTargetMaterials) {
        const bmhpMaterialDetails = await this.repo.findByBmhpMaterialId(c, material.id)
        const materialIds = bmhpMaterialDetails.map((d) => d.material_id)

        const variant = materialIds.length > 0
          ? await this.repo.getMaterialVariantsDetail(c, materialIds)
          : null
        const variantQty = variant?.qty ?? 1
        const requestTestQty = testQtyMap.get(targetGroup.id) ?? 0
        const labResult = variantQty > 0 ? Math.ceil(requestTestQty / variantQty) : 0
        const template = await this.repo.getTemplateMaterial(c, materialIds, request.program_plan_id) ?? []

        packages.push({
          id: material.id,
          title: material.title,
          qty: variant?.qty ?? 1,
          lab_consume: labResult,
          unit: c.var.t(`material_unit.label.${material.unit}`),
          category: material.material_subtype,
          template: template.map(t => ({
            id: t.id,
            title: t.title,
            is_variant: t.is_variant ?? 0,
            material_type: t.material_type ? c.var.t(`material_type.label.${t.material_type}`) : null,
            material_subtype: t.material_subtype ? c.var.t(`material_subtype.label.${t.material_subtype}`) : null,
          })),
        })
      }
      
      // Find target item for this group
      const targetItem = request.target.find(t => t.id === targetGroup.id)
      const sampleQty = targetItem?.sample_qty ?? 0
      const testQty = targetItem?.test_qty ?? 0
      
      results.push({
        id: targetGroup.id,
        name: targetGroup.name,
        sample_qty: sampleQty,
        test_qty: testQty,
        package: packages,
      })
    }
    
    return {
      data: results
    }
  }

  async detailProductVariant(c: Context, id: number, query: GetVariantDetailsQueries) {
    const { data, total } = await this.repo.findVariantDetailsWithPagination(c, id, query)
    const translated = data.map((item) => ({
      ...item,
      unit_name: item.unit_name ? c.var.t(`material_unit.label.${item.unit_name}`) : null,
    }))
    return new PaginatedResponse(query, translated, total)
  }

  async listVariantsByParentMaterialId(c: Context, parentMaterialId: number) {
    const result = await this.repo.findVariantsByParentMaterialId(c, parentMaterialId)

    return {
      data: result
    }
  }
}
