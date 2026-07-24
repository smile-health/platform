import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { formatErrors } from "@smile/lib/zod.js"
import { Context } from "hono"
import z from "zod"
import { ActivityRepository } from "../activity/activity.repository.js"
import { AnnualPlanningProgramPlanRepository } from "../annual-planning-program-plan/annual-planning-program-plan.repository.js"
import { LocationRepository } from "../location/location.repository.js"
import { MaterialRepository } from "../material/material.repository.js"
import { TargetGroupRepository } from "../target-group/target-group.repository.js"
import {
  CreateInput,
  UpdateInput,
  createSchema,
  updateSchema,
} from "./task.schema.js"
import { TaskRepository } from "./task.repository.js"

type TargetGroupWithCoverages = {
  ip: number
  coverages?: Array<{ province_id: number; coverage_number?: number }>
}

export class TaskMiddleware {
  constructor(
    private readonly repository: TaskRepository,
    private readonly materialRepo: MaterialRepository,
    private readonly activityRepo: ActivityRepository,
    private readonly programPlanRepo: AnnualPlanningProgramPlanRepository,
    private readonly targetGroupRepo: TargetGroupRepository,
    private readonly locationRepo: LocationRepository
  ) {}

  private throwValidationError(c: Context, error: z.ZodError) {
    c.set("errors", formatErrors(error, c.var.t, "task"))
    throw new ValidationError()
  }

  private collectProvinceIds(targetGroups?: TargetGroupWithCoverages[]) {
    return Array.from(
      new Set(
        targetGroups?.flatMap(
          (g) => g.coverages?.map((c) => c.province_id) ?? []
        ) ?? []
      )
    )
  }

  private validateProvinceCoverages(
    issues: z.ZodIssue[],
    targetGroups: TargetGroupWithCoverages[] | undefined,
    provinceMap: Record<number, unknown>
  ) {
    targetGroups?.forEach((group, index) => {
      group.coverages?.forEach((coverage, coverageIndex) => {
        if (!provinceMap[coverage.province_id]) {
          issues.push({
            code: z.ZodIssueCode.custom,
            path: [
              "target_groups",
              index,
              "coverages",
              coverageIndex,
              "province_id",
            ],
            message: "validator.not_exist",
          })
        }
      })
    })
  }

  private validateIPRange(
    issues: z.ZodIssue[],
    targetGroups: TargetGroupWithCoverages[] | undefined,
    perUnit: number
  ) {
    targetGroups?.forEach((group, index) => {
      if (group.ip <= 0 || group.ip > perUnit)
        issues.push({
          code: z.ZodIssueCode.custom,
          path: ["target_groups", index, "ip"],
          message: "validator.task.ip_invalid_range",
        })
    })
  }

  private validateCoverageNumberRange(
    c: Context,
    issues: z.ZodIssue[],
    targetGroups: TargetGroupWithCoverages[] | undefined
  ) {
    const min = 1
    const max = 100
    const integerMessage = c.var.t("validator.integer", {
      field: c.var.t("task.label.coverage_number"),
    })
    const message = c.var.t("validator.between", {
      field: c.var.t("task.label.coverage_number"),
      condition: `${min} - ${max}`,
    })

    targetGroups?.forEach((group, index) => {
      group.coverages?.forEach((coverage, coverageIndex) => {
        const n = coverage.coverage_number
        if (typeof n !== "number" || !Number.isFinite(n)) return

        if (!Number.isInteger(n)) {
          issues.push({
            code: z.ZodIssueCode.custom,
            path: [
              "target_groups",
              index,
              "coverages",
              coverageIndex,
              "coverage_number",
            ],
            message: integerMessage,
          })
          return
        }

        if (n < min || n > max) {
          issues.push({
            code: z.ZodIssueCode.custom,
            path: [
              "target_groups",
              index,
              "coverages",
              coverageIndex,
              "coverage_number",
            ],
            message,
          })
        }
      })
    })
  }

  create = (c: Context) => {
    return z.preprocess(async (input) => {
      const parsed = createSchema.safeParse(input)
      const issues: z.ZodIssue[] = parsed.success
        ? []
        : [...parsed.error.issues]

      const item = (parsed.data ?? input) as CreateInput

      const targetGroupIds = Array.from(
        new Set(item.target_groups?.map((g) => g.target_group_id) ?? [])
      )
      const provinceIds = this.collectProvinceIds(item.target_groups)

      const [
        materialMap,
        activityMap,
        programPlanMap,
        targetGroupMap,
        provinceMap,
      ] = await Promise.all([
        this.materialRepo.getMaterialMapped(c, [item.material_id]),
        this.activityRepo.getActivityMapped(c, [item.activity_id]),
        this.programPlanRepo.getProgramPlanMapped(c, [item.program_plan_id]),
        targetGroupIds.length
          ? this.targetGroupRepo.getTargetGroupMapped(c, targetGroupIds)
          : Promise.resolve({}),
        provinceIds.length
          ? this.locationRepo.getLocationMapped(c, provinceIds)
          : Promise.resolve({}),
      ])

      if (!materialMap[item.material_id]) {
        issues.push({
          code: z.ZodIssueCode.custom,
          path: ["material_id"],
          message: "validator.not_exist",
        })
      }

      if (!activityMap[item.activity_id]) {
        issues.push({
          code: z.ZodIssueCode.custom,
          path: ["activity_id"],
          message: "validator.not_exist",
        })
      }

      if (!programPlanMap[item.program_plan_id]) {
        issues.push({
          code: z.ZodIssueCode.custom,
          path: ["program_plan_id"],
          message: "validator.not_exist",
        })
      }

      item.target_groups?.forEach((group, index) => {
        if (!targetGroupMap[group.target_group_id]) {
          issues.push({
            code: z.ZodIssueCode.custom,
            path: ["target_groups", index, "target_group_id"],
            message: "validator.not_exist",
          })
        }
      })

      this.validateProvinceCoverages(issues, item.target_groups, provinceMap)
      this.validateCoverageNumberRange(c, issues, item.target_groups)
      this.validateIPRange(
        issues,
        item.target_groups,
        materialMap[item.material_id]?.consumption_unit_per_distribution_unit ??
          0
      )

      if (issues.length > 0) {
        return this.throwValidationError(c, new z.ZodError(issues))
      }

      return parsed.data
    }, createSchema)
  }

  update = (c: Context) => {
    return z.preprocess(async (input) => {
      const parsed = updateSchema.safeParse(input)
      const issues: z.ZodIssue[] = parsed.success
        ? []
        : [...parsed.error.issues]

      const item = (parsed.data ?? input) as UpdateInput
      const id = c.req.param("id")

      const detail = await this.repository.findById(c, Number(id))
      if (!detail) {
        throw new NotFoundError(
          c.var.t("validator.not_exist", { field: "task" })
        )
      }

      const provinceIds = this.collectProvinceIds(item.target_groups)

      const provinceMap = provinceIds.length
        ? await this.locationRepo.getLocationMapped(c, provinceIds)
        : {}

      this.validateProvinceCoverages(issues, item.target_groups, provinceMap)
      this.validateCoverageNumberRange(c, issues, item.target_groups)
      this.validateIPRange(
        issues,
        item.target_groups,
        detail.rows[0]!.consumption_unit_per_distribution_unit
      )

      if (issues.length > 0) {
        return this.throwValidationError(c, new z.ZodError(issues))
      }

      return parsed.data
    }, updateSchema)
  }
}
