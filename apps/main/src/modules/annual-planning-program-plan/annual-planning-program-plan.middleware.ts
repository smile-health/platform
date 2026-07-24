import { ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { AnnualPlanningProgramPlanRepository } from "./annual-planning-program-plan.repository.js"
import {
  CopyProgramPlanRequest,
  SubmitProgramPlanRequest,
} from "./annual-planning-program-plan.schema.js"
import { AnnualPlanningGroupTargetRepository } from "../annual-planning-group-target/annual-planning-group-target.repository.js"
import { TaskRepository } from "../task/task.repository.js"
import { MaterialRatioRepository } from "../material-ratio/material-ratio.repository.js"
import { AnnualPlanningMaterialSubstitutionRepository } from "../annual-planning-material-substitution/annual-planning-material-substitution.repository.js"

export class AnnualPlanningProgramPlanMiddleware {
  constructor(
    private readonly repository: AnnualPlanningProgramPlanRepository,
    private readonly groupTargetRepo: AnnualPlanningGroupTargetRepository,
    private readonly taskRepo: TaskRepository,
    private readonly materialRatioRepo: MaterialRatioRepository,
    private readonly materialSubstitutionRepo: AnnualPlanningMaterialSubstitutionRepository
  ) {}

  #validateCopyItems(c: Context, items: string[]) {
    for (const item of items) {
      if (item === "task" && items.indexOf("target_group") === -1) {
        throw new ValidationError(
          c.var.t("validator.copy_program_plan_requires_target_group")
        )
      }

      if (
        (item === "material_substitution" || item === "material_ratio") &&
        items.indexOf("task") === -1
      ) {
        throw new ValidationError(
          c.var.t("validator.copy_program_plan_requires_task")
        )
      }
    }
  }

  async #validateTargetYear(
    c: Context,
    body: CopyProgramPlanRequest,
    sourceProgramPlan: {
      approach_id: number
      year: number
    }
  ) {
    const { target_year } = body
    const { programId } = c.var

    if (sourceProgramPlan.year >= target_year) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_invalid_target_year")
      )
    }

    const targetYear = await this.repository.findOne(c, {
      year: target_year,
      approach_id: sourceProgramPlan.approach_id,
      program_id: programId,
    })

    if (targetYear) {
      throw new ValidationError(
        c.var.t("validator.invalid_submit_program_plan_already_exist")
      )
    }
  }

  async #getListGroupTarget(
    c: Context,
    programPlanId: number,
    body: CopyProgramPlanRequest
  ) {
    const { copy_items } = body
    if (copy_items.indexOf("target_group") === -1) {
      return []
    }

    const list = await this.groupTargetRepo.find(c, {
      program_plan_id: programPlanId,
    })

    if (copy_items.indexOf("target_group") !== -1 && list.length === 0) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_no_target_group_found")
      )
    }

    return list
  }

  async #getListTasks(
    c: Context,
    programPlanId: number,
    body: CopyProgramPlanRequest
  ) {
    const { copy_items } = body
    if (copy_items.indexOf("task") === -1) {
      return []
    }

    const list = await this.taskRepo.find(c, { program_plan_id: programPlanId })
    if (copy_items.indexOf("task") !== -1 && list.length === 0) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_no_task_found")
      )
    }

    return list
  }

  async #getListMaterialRatios(
    c: Context,
    programPlanId: number,
    body: CopyProgramPlanRequest
  ) {
    const { copy_items } = body
    if (copy_items.indexOf("material_ratio") === -1) {
      return []
    }

    const list = await this.materialRatioRepo.find(c, {
      program_plan_id: programPlanId,
    })
    if (copy_items.indexOf("material_ratio") !== -1 && list.length === 0) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_no_material_ratio_found")
      )
    }

    return list
  }

  async #getListMaterialSubstitution(
    c: Context,
    programPlanId: number,
    body: CopyProgramPlanRequest
  ) {
    const { copy_items } = body
    if (copy_items.indexOf("material_substitution") === -1) {
      return []
    }

    const list = await this.materialSubstitutionRepo.find(c, {
      program_plan_id: programPlanId,
    })
    if (
      copy_items.indexOf("material_substitution") !== -1 &&
      list.length === 0
    ) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_no_material_substitution_found")
      )
    }

    return list
  }

  submit = async (c: Context, body: SubmitProgramPlanRequest) => {
    const { year, approach_id } = body
    const { programId } = c.var
    const result = await this.repository.findOne(c, {
      year,
      approach_id,
      program_id: programId,
    })

    if (result) {
      throw new ValidationError(
        c.var.t("validator.invalid_submit_program_plan_already_exist")
      )
    }

    return body
  }

  copy = async (c: Context, body: CopyProgramPlanRequest) => {
    const { source_id, copy_items } = body
    const { programId } = c.var

    const sourceProgramPlan = await this.repository.findOne(c, {
      id: source_id,
      program_id: programId,
    })

    if (!sourceProgramPlan) {
      throw new ValidationError(
        c.var.t("validator.copy_program_plan_source_program_plan_not_found")
      )
    }

    await this.#validateTargetYear(c, body, sourceProgramPlan)
    this.#validateCopyItems(c, copy_items)

    const [groupTarget, listTasks, materialRatios, materialSubstitution] =
      await Promise.all([
        this.#getListGroupTarget(c, source_id, body),
        this.#getListTasks(c, source_id, body),
        this.#getListMaterialRatios(c, source_id, body),
        this.#getListMaterialSubstitution(c, source_id, body),
      ])

    const listTaskIds = listTasks.map((item) => item.id)
    const coverages = await this.repository.getCoverageByPlanTaskId(
      c,
      listTaskIds
    )

    // Reconstruct body
    body.approach_id = sourceProgramPlan.approach_id
    body.source_target_group_ids = groupTarget.map(
      (item) => item.target_group_id
    )
    body.source_task_list = listTasks.map((item) => ({
      id: item.id,
      code: item.code,
      program_plan_id: item.program_plan_id,
      material_id: item.material_id,
      activity_id: item.activity_id,
      ip: item.ip,
      month_distribution: item.month_distribution,
      target_group_id: item.target_group_id,
      number_of_dose: item.number_of_dose,
    }))
    body.source_coverages = coverages
    body.source_material_ratios = materialRatios.map((item) => ({
      program_plan_id: item.program_plan_id,
      from_subtype_id: item.from_subtype_id,
      from_material_id: item.from_material_id,
      from_material_qty: item.from_material_qty,
      to_subtype_id: item.to_subtype_id,
      to_material_id: item.to_material_id,
      to_material_qty: item.to_material_qty,
    }))
    body.source_material_substitutions = materialSubstitution.map((item) => ({
      program_plan_id: item.program_plan_id,
      material_id: item.material_id,
      substitution_material_id: item.substitution_material_id,
    }))

    return body
  }
}
