import { ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { generateEventCode } from "@smile/lib/utils.js"
import { Context } from "hono"
import { AnnualPlanningProgramPlanRepository } from "./annual-planning-program-plan.repository.js"
import {
  CopyProgramPlanRequest,
  GetListProgramPlanQueries,
  ProgramPlanTaskDTO,
  SubmitProgramPlanRequest,
} from "./annual-planning-program-plan.schema.js"

export class AnnualPlanningProgramPlanModule {
  constructor(
    private readonly repository: AnnualPlanningProgramPlanRepository
  ) {}

  async submitTargetGroup(
    c: Context,
    programPlanId: number,
    params: CopyProgramPlanRequest
  ) {
    const { copy_items, source_target_group_ids } = params
    if (copy_items.indexOf("target_group") !== -1) {
      const payload = source_target_group_ids.map((id) => ({
        target_group_id: id,
        program_plan_id: programPlanId,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      }))

      await c.var.trx
        .insertInto("ws_plan_target_group")
        .values(payload)
        .execute()
    }
  }

  async submitTask(
    c: Context,
    programPlanId: number,
    params: CopyProgramPlanRequest
  ) {
    const { copy_items, source_task_list, source_coverages } = params
    if (copy_items.indexOf("task") !== -1) {
      const payload = await Promise.all(
        source_task_list.map(async (item) => ({
          activity_id: item.activity_id,
          code: await generateEventCode({
            length: 10,
            includeUppercase: true,
            includeLowercase: false,
            includeNumbers: true,
          }),
          ip: item.ip,
          material_id: item.material_id,
          month_distribution: item.month_distribution,
          number_of_dose: item.number_of_dose,
          program_plan_id: programPlanId,
          target_group_id: item.target_group_id,
          created_by: c.var.userId,
          updated_by: c.var.userId,
        }))
      )

      const taskResult = await c.var.trx
        .insertInto("ws_plan_tasks")
        .values(payload)
        .execute()

      const baseInsertId = Number(taskResult[0]!.insertId)
      const result = source_task_list.map((item, index) => ({
        id: item.id,
        insertId: baseInsertId + index,
      }))

      const payloadCoverage: ProgramPlanTaskDTO[] = []
      source_coverages.forEach((cov) => {
        const mappedTask = result.find((task) => task.id === cov.plan_task_id)
        if (mappedTask) {
          payloadCoverage.push({
            plan_task_id: mappedTask.insertId,
            province_id: cov.province_id,
            coverage_number: cov.coverage_number,
            created_by: c.var.userId,
            updated_by: c.var.userId,
          })
        }
      })

      if (payloadCoverage.length > 0)
        await c.var.trx
          .insertInto("ws_coverage")
          .values(payloadCoverage)
          .execute()
    }
  }

  async submitMaterialRatio(
    c: Context,
    programPlanId: number,
    params: CopyProgramPlanRequest
  ) {
    const { copy_items, source_material_ratios } = params
    if (copy_items.indexOf("material_ratio") !== -1) {
      const payload = source_material_ratios.map((ratio) => ({
        from_subtype_id: ratio.from_subtype_id,
        from_material_id: ratio.from_material_id,
        from_material_qty: ratio.from_material_qty,
        to_subtype_id: ratio.to_subtype_id,
        to_material_id: ratio.to_material_id,
        to_material_qty: ratio.to_material_qty,
        program_plan_id: programPlanId,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      }))

      await c.var.trx.insertInto("ws_material_ratios").values(payload).execute()
    }
  }

  async submitMaterialSubstitution(
    c: Context,
    programPlanId: number,
    params: CopyProgramPlanRequest
  ) {
    const { copy_items, source_material_substitutions } = params
    if (copy_items.indexOf("material_substitution") !== -1) {
      const payload = source_material_substitutions.map((substitution) => ({
        material_id: substitution.material_id,
        substitution_material_id: substitution.substitution_material_id,
        program_plan_id: programPlanId,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      }))

      await c.var.trx
        .insertInto("ws_material_substitutions")
        .values(payload)
        .execute()
    }
  }

  async list(c: Context, params: GetListProgramPlanQueries) {
    const { programId } = c.var
    const { is_final } = params
    const { list, total } = await this.repository.getListProgramPlan(
      c,
      params,
      programId
    )
    const result = list
      .map((item) => {
        return {
          id: item.id,
          year: item.year,
          approach: {
            id: item.approach_id,
            name: item.approach_name,
          },
          program_id: item.program_id,
          is_final: item.status === 1,
          updated_at: item.updated_at,
          user_created_by: item.id_created
            ? {
                id: item.id_created,
                username: item.username_created,
                firstname: item.firstname_created,
                lastname: item.lastname_created,
              }
            : null,
          user_updated_by: item.id_updated
            ? {
                id: item.id_updated,
                username: item.username_updated,
                firstname: item.firstname_updated,
                lastname: item.lastname_updated,
              }
            : null,
        }
      })
      .filter((item) => is_final === undefined || item.is_final === is_final)

    return new PaginatedResponse(params, result, total)
  }

  async detail(c: Context, id: number) {
    const { programId } = c.var
    const detail = await this.repository.getDetailProgramPlan(c, id, programId)
    if (!detail) {
      throw new ValidationError(c.var.t("validator.program_plan_not_found"))
    }

    const isBmhp = detail.approach_name === "BMHP"
    const status = isBmhp
      ? await this.repository.getBmhpStatus(c, id)
      : {
          target_group: !!detail.id_target_group,
          population: !!detail.id_population,
          needs_calculation: !!detail.id_tasks,
          material_ratio: !!detail.id_material_ratio,
          material_substitution: !!detail.id_material_substitution,
        }

    return {
      id: detail.id,
      year: detail.year,
      approach: {
        id: detail.approach_id,
        name: detail.approach_name,
      },
      status,
      program_id: detail.program_id,
      is_final: detail.status === 1,
    }
  }

  async submit(c: Context, params: SubmitProgramPlanRequest) {
    const { year, approach_id } = params
    const payload = {
      year,
      approach_id,
      status: 0,
    }

    await this.repository.create(c, payload)

    return { message: "Success" }
  }

  async status(c: Context, id: number) {
    const { programId } = c.var
    const detail = await this.repository.getDetailProgramPlan(c, id, programId)
    if (!detail) {
      throw new ValidationError(c.var.t("validator.program_plan_not_found"))
    }

    const isBmhp = detail.approach_name === "BMHP"
    if (isBmhp) {
      const bmhpStatus = await this.repository.getBmhpStatus(c, id)
      return { id, ...bmhpStatus }
    }

    return {
      id,
      target_group_complete: !!detail.id_target_group,
      population_complete: !!detail.id_population,
      task_complete: !!detail.id_tasks,
      ratio_complete: !!detail.id_material_ratio,
      substitution_complete: !!detail.id_material_substitution,
    }
  }

  async submitStatus(c: Context, id: number) {
    const { programId } = c.var
    const detail = await this.repository.getDetailProgramPlan(c, id, programId)

    if (!detail) {
      throw new ValidationError(c.var.t("validator.program_plan_not_found"))
    }

    const isBmhp = detail.approach_name === "BMHP"
    if (isBmhp) {
      const bmhpStatus = await this.repository.getBmhpStatus(c, id)
      const allComplete = Object.values(bmhpStatus).every(Boolean)
      if (!allComplete) {
        throw new ValidationError(
          "Tidak dapat memfinalkan. Pastikan semua data telah lengkap."
        )
      }
    }

    await this.repository.update(c, { status: 1 }, { id })
    return { message: "Success" }
  }

  async copy(c: Context, params: CopyProgramPlanRequest) {
    const { target_year, approach_id } = params

    // Create new program plan
    const result = await this.repository.create(c, {
      year: target_year,
      approach_id,
      status: 0,
    })
    const newProgramPlanId = Number(result.insertId)

    await Promise.all([
      this.submitTargetGroup(c, newProgramPlanId, params),
      this.submitTask(c, newProgramPlanId, params),
      this.submitMaterialRatio(c, newProgramPlanId, params),
      this.submitMaterialSubstitution(c, newProgramPlanId, params),
    ])

    return {
      message: c.var.t("copy_program_plan.success"),
      new_program_plan_id: newProgramPlanId,
    }
  }
}
