import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { ValidationError } from "@smile/lib/error.js"
import { Context } from "hono"
import { BmhpExaminationTypeRepository } from "./bmhp-examination-type.repository.js"
import { BmhpExaminationRepository } from "./bmhp-examination.repository.js"
import { BmhpExaminationTargetGroupRepository } from "../bmhp-examination-target-groups/bmhp-examination-target-groups.repository.js"
import {
  BmhpExaminationMethodRepository,
  WsBmhpExaminationMethodRepository,
} from "../bmhp-examination-methods/bmhp-examination-methods.repository.js"
import { BmhpExaminationParameterRepository } from "../bmhp-examination-parameters/bmhp-examination-parameters.repository.js"
import { ExaminationTargetMaterialsRepository } from "./examination-target-materials.repository.js"
import {
  type CreateExaminationTypeBody,
  type GetListExaminationTypeQuery,
  type UpdateExaminationTypeBody,
  type CreateExaminationBody,
  type GetListExaminationQuery,
  type UpdateExaminationBody,
  type CreateExaminationTargetMaterialBody,
  type GetExaminationTargetMaterialsQuery,
  type UpdateExaminationTargetMaterialBody,
} from "./bmhp-examination.schema.js"

/* ========== Examination Type Functions ========== */

export async function listExaminationTypes(
  c: Context,
  repository: BmhpExaminationTypeRepository,
  params: GetListExaminationTypeQuery
) {
  const { list, total } = await repository.findList(c, params)
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
      description: rest.description ?? "-",
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
  return new PaginatedResponse(params, formattedList, total)
}

export async function detailExaminationType(
  c: Context,
  repository: BmhpExaminationTypeRepository,
  id: number
) {
  const result = await repository.findDetailById(c, id)
  if (!result) return null
  const row = result as Record<string, unknown>
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
  } = row
  return {
    ...rest,
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

export async function createExaminationType(
  c: Context,
  repository: BmhpExaminationTypeRepository,
  body: CreateExaminationTypeBody
) {
  const result = await repository.create(c, {
    program_plan_id: body.program_plan_id ?? null,
    name: body.name,
    description: body.description ?? null,
  })

  return { id: Number(result.insertId) }
}

export async function updateExaminationType(
  c: Context,
  repository: BmhpExaminationTypeRepository,
  id: number,
  body: UpdateExaminationTypeBody
) {
  await repository.update(
    c,
    {
      ...(body.program_plan_id !== undefined && {
        program_plan_id: body.program_plan_id,
      }),
      name: body.name,
      description: body.description ?? null,
    },
    { id }
  )
}

export async function deleteExaminationType(
  c: Context,
  repository: BmhpExaminationTypeRepository,
  id: number
) {
  const isUsed = await repository.checkUsage(c, id)
  if (isUsed) {
    throw new ValidationError("Data is already in use and cannot be deleted")
  }

  await repository.delete(c, { id })
}

/* ========== Mobile App Functions ========== */

export async function listExaminationTypesForMobile(
  c: Context,
  repository: BmhpExaminationTypeRepository
) {
  return repository.findAllActive(c)
}

export async function listExaminationsGroupedByType(
  c: Context,
  repository: BmhpExaminationRepository
) {
  const examinations = await repository.findActiveGroupedByType(c)

  // Group by examination_type_id
  const grouped = new Map<
    number,
    {
      examination_type_id: number
      examination_type_name: string
      examinations: Array<{
        id: number
        name: string
        description: string | null
      }>
    }
  >()

  for (const exam of examinations) {
    if (!grouped.has(exam.examination_type_id)) {
      grouped.set(exam.examination_type_id, {
        examination_type_id: exam.examination_type_id,
        examination_type_name: exam.examination_type_name,
        examinations: [],
      })
    }
    grouped.get(exam.examination_type_id)!.examinations.push({
      id: exam.id,
      name: exam.name,
      description: exam.description,
    })
  }

  return Array.from(grouped.values())
}

/* ========== Examination Module ========== */

export class BmhpExaminationModule {
  constructor(
    private readonly repository: BmhpExaminationRepository,
    private readonly targetGroupRepository: BmhpExaminationTargetGroupRepository,
    private readonly methodRepository: BmhpExaminationMethodRepository,
    private readonly wsMethodRepository: WsBmhpExaminationMethodRepository,
    private readonly parameterRepository: BmhpExaminationParameterRepository,
    private readonly targetMaterialsRepository: ExaminationTargetMaterialsRepository
  ) {}

  async list(c: Context, params: GetListExaminationQuery) {
    const { list, total } = await this.repository.findList(c, params)

    // If no examinations, return early
    if (list.length === 0) {
      return new PaginatedResponse(params, list, total)
    }

    // Batch fetch parameters for all examinations
    const examinationIds = list.map((exam) => exam.id)
    const allParameters = await this.parameterRepository.findByExaminationIds(
      c,
      examinationIds
    )

    // Group parameters by examination_id
    const parametersByExamId = new Map<number, Array<string>>()

    for (const param of allParameters) {
      if (!parametersByExamId.has(param.examination_id)) {
        parametersByExamId.set(param.examination_id, [])
      }
      parametersByExamId.get(param.examination_id)!.push(param.parameter_name)
    }

    // Attach parameters to each examination
    const listWithParameters = list.map((exam) => {
      const row = exam as Record<string, unknown>
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
        parameters: parametersByExamId.get(exam.id) || [],
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

    return new PaginatedResponse(params, listWithParameters, total)
  }

  async detail(c: Context, id: number) {
    const [examination, targetGroups, methods, parameters, materials] =
      await Promise.all([
        this.repository.findDetailById(c, id),
        this.targetGroupRepository.findByExaminationId(c, id),
        this.methodRepository.findByExaminationId(c, id),
        this.parameterRepository.findByExaminationId(c, id),
        this.targetMaterialsRepository.findByExaminationId(c, id),
      ])

    if (!examination) {
      return null
    }

    // Transform materials to group by material_id with their target_group_ids
    const materialsByMaterialId = new Map<
      number,
      {
        material_id: number
        material_name: string
        target_group_ids: number[]
      }
    >()

    for (const material of materials) {
      if (!materialsByMaterialId.has(material.bmhp_material_id)) {
        materialsByMaterialId.set(material.bmhp_material_id, {
          material_id: material.bmhp_material_id,
          material_name: material.material_name,
          target_group_ids: [],
        })
      }
      materialsByMaterialId
        .get(material.bmhp_material_id)!
        .target_group_ids.push(material.target_group_id)
    }

    const examRow = examination as Record<string, unknown>
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
      ...examRest
    } = examRow

    return {
      ...examRest,
      target_groups: targetGroups.map((tg) => ({
        id: tg.target_group_id,
        name: tg.target_group_name,
        code: tg.target_group_code,
        age_range: tg.target_group_age_range,
      })),
      methods: methods.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
      })),
      parameters: parameters.map((p) => ({
        id: p.parameter_id,
        name: p.parameter_name,
        unit: p.parameter_unit,
        sort_order: p.sort_order,
      })),
      materials: Array.from(materialsByMaterialId.values()),
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

  async create(c: Context, body: CreateExaminationBody) {
    const result = await this.repository.create(c, {
      program_plan_id: body.program_plan_id ?? null,
      examination_type_id: body.examination_type_id,
      name: body.name,
      description: body.description ?? null,
      is_active: body.is_active ? 1 : 0,
    })

    const examinationId = Number(result.insertId)

    const targetGroupIds = this.resolveTargetGroupIds(
      body.target_group_ids,
      body.materials
    )

    await this.linkTargetGroups(c, examinationId, targetGroupIds)
    await this.linkMethods(c, examinationId, body.method_ids)
    await this.linkParameters(c, examinationId, body.parameters)

    if (body.materials && body.materials.length > 0) {
      const targetGroupMap = await this.buildTargetGroupMap(
        c,
        examinationId,
        targetGroupIds
      )
      await this.linkMaterials(c, body.materials, targetGroupMap)
    }

    return { id: examinationId }
  }

  async update(c: Context, id: number, body: UpdateExaminationBody) {
    await this.repository.update(
      c,
      {
        ...(body.program_plan_id !== undefined && {
          program_plan_id: body.program_plan_id,
        }),
        examination_type_id: body.examination_type_id,
        name: body.name,
        description: body.description ?? null,
        ...(body.is_active !== undefined && {
          is_active: body.is_active ? 1 : 0,
        }),
      },
      { id }
    )

    // Resolve target groups: derive from materials if not explicitly provided (same as create)
    const targetGroupIds = this.resolveTargetGroupIds(
      body.target_group_ids,
      body.materials
    )

    // Delete old target materials before deleting target groups
    const oldExamTargetGroups =
      await this.targetGroupRepository.findByExaminationId(c, id)
    for (const etg of oldExamTargetGroups) {
      await this.targetMaterialsRepository.deleteByExamTargetGroupId(c, etg.id)
    }

    // Re-sync target groups
    await this.targetGroupRepository.deleteByExaminationId(c, id)
    await this.linkTargetGroups(c, id, targetGroupIds)

    if (body.method_ids !== undefined) {
      await this.wsMethodRepository.deleteByExaminationId(c, id)
      await this.linkMethods(c, id, body.method_ids)
    }

    if (body.parameters !== undefined) {
      await this.parameterRepository.deleteByExaminationId(c, id)
      await this.linkParameters(c, id, body.parameters)
    }

    // Re-link materials using the same approach as create
    if (body.materials && body.materials.length > 0) {
      const targetGroupMap = await this.buildTargetGroupMap(
        c,
        id,
        targetGroupIds
      )
      await this.linkMaterials(c, body.materials, targetGroupMap)
    }
  }

  private resolveTargetGroupIds(
    targetGroupIds?: number[],
    materials?: Array<{ material_id: number; target_group_ids: number[] }>
  ): number[] {
    if (targetGroupIds && targetGroupIds.length > 0) {
      return targetGroupIds
    }
    if (!materials || materials.length === 0) {
      return []
    }
    const unique = new Set<number>()
    for (const material of materials) {
      for (const tgId of material.target_group_ids) {
        unique.add(tgId)
      }
    }
    return Array.from(unique)
  }

  private async linkTargetGroups(
    c: Context,
    examinationId: number,
    targetGroupIds: number[]
  ) {
    for (const targetGroupId of targetGroupIds) {
      await this.targetGroupRepository.create(c, {
        examination_id: examinationId,
        target_group_id: targetGroupId,
      })
    }
  }

  private async linkMethods(
    c: Context,
    examinationId: number,
    methodIds?: number[]
  ) {
    if (!methodIds) return
    for (const methodId of methodIds) {
      await this.wsMethodRepository.create(c, {
        examination_id: examinationId,
        method_id: methodId,
      })
    }
  }

  private async linkParameters(
    c: Context,
    examinationId: number,
    parameters?: Array<{ id: number; sort_order?: number }>
  ) {
    if (!parameters) return
    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i]
      await this.parameterRepository.create(c, {
        examination_id: examinationId,
        parameter_id: param.id,
        sort_order: param.sort_order ?? i + 1,
      })
    }
  }

  private async buildTargetGroupMap(
    c: Context,
    examinationId: number,
    targetGroupIds: number[]
  ): Promise<Map<number, number>> {
    const map = new Map<number, number>()
    for (const targetGroupId of targetGroupIds) {
      const etg =
        await this.targetGroupRepository.findOneByExaminationIdAndTargetGroupId(
          c,
          examinationId,
          targetGroupId
        )
      if (etg) {
        map.set(targetGroupId, etg.id)
      }
    }
    return map
  }

  private async linkMaterials(
    c: Context,
    materials: Array<{ material_id: number; target_group_ids: number[] }>,
    targetGroupMap: Map<number, number>
  ) {
    for (const material of materials) {
      for (const targetGroupId of material.target_group_ids) {
        const examTargetGroupId = targetGroupMap.get(targetGroupId)
        if (examTargetGroupId) {
          await this.targetMaterialsRepository.create(c, {
            exam_target_group_id: examTargetGroupId,
            bmhp_material_id: material.material_id,
          })
        }
      }
    }
  }

  async delete(c: Context, id: number) {
    const isUsed = await this.repository.checkUsage(c, id)
    if (isUsed) {
      throw new ValidationError("Data is already in use and cannot be deleted")
    }

    await this.repository.delete(c, { id })
  }

  async getTargetGroups(c: Context, examinationId: number) {
    const targetGroups = await this.targetGroupRepository.findByExaminationId(
      c,
      examinationId
    )

    return {
      data: targetGroups.map((tg) => ({
        id: tg.target_group_id,
        name: tg.target_group_name,
      })),
    }
  }

  async getMethods(c: Context, examinationId: number) {
    const methods = await this.methodRepository.findByExaminationId(
      c,
      examinationId
    )

    return {
      data: methods.map((m) => ({
        id: m.id,
        name: m.name,
      })),
    }
  }
}

/* ========== Examination Target Materials Module ========== */

export class ExaminationTargetMaterialsModule {
  constructor(
    private readonly repository: ExaminationTargetMaterialsRepository
  ) {}

  async list(c: Context, query: GetExaminationTargetMaterialsQuery) {
    const { list, total } = await this.repository.findWithPagination(c, query)
    return new PaginatedResponse(query, list, total)
  }

  async detail(c: Context, id: number) {
    const result = await this.repository.findByIdWithDetails(c, id)
    if (!result) {
      throw new Error("Examination target material not found")
    }
    return result
  }

  async create(c: Context, body: CreateExaminationTargetMaterialBody) {
    const result = await this.repository.create(c, {
      exam_target_group_id: body.exam_target_group_id,
      bmhp_material_id: body.bmhp_material_id,
    })

    const id = Number(result.insertId)
    return this.repository.findByIdWithDetails(c, id)
  }

  async update(
    c: Context,
    id: number,
    body: UpdateExaminationTargetMaterialBody
  ) {
    await this.repository.update(
      c,
      {
        exam_target_group_id: body.exam_target_group_id,
        bmhp_material_id: body.bmhp_material_id,
      },
      { id }
    )

    return this.repository.findByIdWithDetails(c, id)
  }

  async delete(c: Context, id: number) {
    await this.repository.delete(c, { id })
    return { message: "Examination target material deleted successfully" }
  }

  async getByMaterial(c: Context, materialId: number) {
    return await this.repository.findByMaterialId(c, materialId)
  }

  async getByExamTargetGroup(c: Context, examTargetGroupId: number) {
    return await this.repository.findByExamTargetGroupId(c, examTargetGroupId)
  }
}
