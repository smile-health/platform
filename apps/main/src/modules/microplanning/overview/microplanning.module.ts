import { PERCENTAGE_100 } from "@/common/constants/target.js"
import { NotFoundError, ValidationError } from "@smile/lib/error.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import { Context } from "hono"
import { ActivityPlanModule } from "../activity-plan/activity-plan.module.js"
import { PriorityAreasRepository } from "../priority-areas/priority-areas.repository.js"
import { TargetsModule } from "../targets/targets.module.js"
import { MicroplanningRepository } from "./microplanning.repository.js"
import {
  MicroplanningConfigQuery,
  MicroplanningSchoolsQuery,
  MicroplanningStepsResponse,
  MicroplanningYear,
  MicroplanningYearsResponse,
  MicroplanningYearStatus,
  Step,
  StepStatus,
  SubStep,
  SubmitMicroplanningResponse,
  SummaryTargetAndRiskResponse,
  TargetGroupCount,
} from "./microplanning.schema.js"

export class MicroplanningModule {
  constructor(
    private readonly repository: MicroplanningRepository,
    private readonly priorityAreasRepository: PriorityAreasRepository,
    private readonly activityPlanModule: ActivityPlanModule,
    private readonly targetsModule: TargetsModule
  ) {}

  async getMicroplanningSteps(
    c: Context,
    subDistrictId: number,
    entityId: number,
    category?: "bias" | "non-bias"
  ): Promise<MicroplanningStepsResponse> {
    const microplanningId = c.var.microplanningId!

    const microplanning = await this.repository.getMicroplanningById(
      c,
      microplanningId
    )
    const isSubmitted = microplanning?.status === 1

    const inputTargetDataStep = await this.#getInputTargetDataStep(
      c,
      subDistrictId,
      microplanningId
    )

    let additionalSteps: Step[] = []
    if (category) {
      if (category === "non-bias") {
        additionalSteps = await Promise.all([
          this.#getTargetEstimationNonBiasStep(c, subDistrictId, microplanningId),
          this.#getVaccineMaterialNeedsStep(c, subDistrictId, microplanningId),
        ])
      } else {
        additionalSteps = await Promise.all([
          this.#getTargetEstimationBiasStep(
            c,
            subDistrictId,
            microplanningId,
            entityId
          ),
          this.#getVaccineMaterialNeedsBiasStep(
            c,
            subDistrictId,
            microplanningId,
            entityId
          ),
        ])
      }
    } else {
      const [nonBiasEstimation, biasEstimation, nonBiasMaterial, biasMaterial] =
        await Promise.all([
          this.#getTargetEstimationNonBiasStep(c, subDistrictId, microplanningId),
          this.#getTargetEstimationBiasStep(
            c,
            subDistrictId,
            microplanningId,
            entityId
          ),
          this.#getVaccineMaterialNeedsStep(c, subDistrictId, microplanningId),
          this.#getVaccineMaterialNeedsBiasStep(
            c,
            subDistrictId,
            microplanningId,
            entityId
          ),
        ])

      additionalSteps = [
        this.#mergeEstimationSteps(c, nonBiasEstimation, biasEstimation),
        this.#mergeMaterialSteps(c, nonBiasMaterial, biasMaterial),
        await this.#checkHealthcareMapIsCreated(c, microplanningId),
        await this.#getAreaPrioritizationDecisionStep(c, microplanningId),
        await this.#getProblemSolutionStep(c, microplanningId),
        await this.#getActivityPlanStep(c, microplanningId),
      ]
    }

    const steps: Step[] = [inputTargetDataStep, ...additionalSteps]

    for (const step of steps) {
      step.is_modified = 0
    }

    // A step is disabled if any previous step is not 100% completed
    for (let i = 1; i < steps.length; i++) {
      const hasIncompletePreviousStep = steps
        .slice(0, i)
        .some((step) => step.status.percentage < PERCENTAGE_100)
      if (hasIncompletePreviousStep) {
        steps[i].status = {
          ...steps[i].status,
          status: "disabled",
        }
      }
    }

    if (isSubmitted) {
      const [
        targetsModified,
        villageEstimationModified,
        schoolEstimationModified,
        materialNeedsModified,
        mapModified,
        priorityAreasModified,
        problemSolutionModified,
        activityPlanModified,
      ] = await Promise.all([
        this.repository.hasUnsubmittedTargets(c, microplanningId),
        this.repository.hasUnsubmittedVillageEstimation(c, microplanningId),
        this.repository.hasUnsubmittedSchoolEstimation(c, microplanningId),
        this.repository.hasUnsubmittedMaterialNeeds(c, microplanningId),
        this.repository.hasUnsubmittedMapData(c, microplanningId),
        this.repository.hasUnsubmittedPriorityAreas(c, microplanningId),
        this.repository.hasUnsubmittedProblemSolutions(c, microplanningId),
        this.repository.hasUnsubmittedActivityPlans(c, microplanningId),
      ])

      const modifiedMap: Record<number, boolean> = {
        0: targetsModified,
        1: villageEstimationModified || schoolEstimationModified,
        2: materialNeedsModified,
        3: mapModified,
        4: priorityAreasModified,
        5: problemSolutionModified,
        6: activityPlanModified,
      }

      for (const step of steps) {
        if (modifiedMap[step.step_number]) {
          step.is_modified = 1
        }
      }
    }

    return { is_submitted: isSubmitted, steps }
  }

  #mergeEstimationSteps(c: Context, nonBias: Step, bias: Step): Step {
    const subSteps: SubStep[] = [
      ...(nonBias.sub_steps || []),
      ...(bias.sub_steps || []),
    ]

    const totalCompleted =
      (nonBias.status.completed || 0) + (bias.status.completed || 0)
    const totalCount = (nonBias.status.total || 0) + (bias.status.total || 0)

    const allSubStepsStarted = subSteps.every((s) => s.completed >= 1)
    const status = allSubStepsStarted
      ? this.#calculateStatus(totalCompleted, totalCount)
      : {
          status: "not_completed" as const,
          completed: totalCompleted,
          total: totalCount,
          percentage:
            totalCount > 0
              ? Math.ceil((totalCompleted / totalCount) * PERCENTAGE_100)
              : 0,
        }

    return {
      step_number: 1,
      title: c.var.t("microplanning.responses.target_estimation_data"),
      status,
      sub_steps: subSteps,
    }
  }

  #mergeMaterialSteps(c: Context, nonBias: Step, bias: Step): Step {
    const subSteps: SubStep[] = [
      ...(nonBias.sub_steps || []),
      ...(bias.sub_steps || []),
    ]

    const totalCompleted =
      (nonBias.status.completed || 0) + (bias.status.completed || 0)
    const totalCount = (nonBias.status.total || 0) + (bias.status.total || 0)

    const allSubStepsStarted = subSteps.every((s) => s.completed >= 1)
    const status = allSubStepsStarted
      ? this.#calculateStatus(totalCompleted, totalCount)
      : {
          status: "not_completed" as const,
          completed: totalCompleted,
          total: totalCount,
          percentage:
            totalCount > 0
              ? Math.ceil((totalCompleted / totalCount) * PERCENTAGE_100)
              : 0,
        }

    return {
      step_number: 2,
      title: c.var.t("microplanning.responses.vaccine_and_immunization"),
      status,
      sub_steps: subSteps,
    }
  }

  async #getInputTargetDataStep(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<Step> {
    const [villagesWithTargets, schoolsWithTargets] = await Promise.all([
      this.repository.getVillagesWithTargets(c, microplanningId),
      this.repository.getSchoolsWithTargets(c, microplanningId),
    ])

    const totalVillages = villagesWithTargets.length
    const totalSchools = schoolsWithTargets.length
    const total = totalVillages + totalSchools

    return {
      step_number: 0,
      title: c.var.t("microplanning.responses.input_target"),
      status: {
        status: "completed",
        completed: total,
        total,
        percentage: PERCENTAGE_100,
      },
    }
  }

  async #getTargetEstimationNonBiasStep(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<Step> {
    const villages = await this.repository.getVillagesBySubDistrict(
      c,
      microplanningId
    )

    if (villages.length === 0) {
      return {
        step_number: 1,
        title: c.var.t("microplanning.responses.target_estimation_data"),
        status: this.#calculateStatus(0, 0),
        sub_steps: [
          {
            key: "non-bias",
            name: c.var.t("microplanning.sub_steps.non_bias"),
            completed: 0,
            total: 0,
          },
        ],
      }
    }

    const villageIds = villages.map((v) => v.village_id)
    const estimationStatus = await this.repository.getVillageEstimationStatus(
      c,
      microplanningId,
      villageIds
    )

    const completedVillages = estimationStatus.length
    const totalVillages = villages.length

    return {
      step_number: 1,
      title: c.var.t("microplanning.responses.target_estimation_data"),
      status: this.#calculateStatus(completedVillages, totalVillages),
      sub_steps: [
        {
          key: "non-bias",
          name: c.var.t("microplanning.sub_steps.non_bias"),
          completed: completedVillages,
          total: totalVillages,
        },
      ],
    }
  }

  async #getTargetEstimationBiasStep(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    entityId: number
  ): Promise<Step> {
    const schools = await this.repository.getSchoolsBySubDistrict(
      c,
      microplanningId
    )

    if (schools.length === 0) {
      return {
        step_number: 1,
        title: c.var.t("microplanning.responses.target_estimation_data"),
        status: this.#calculateStatus(0, 1),
        sub_steps: [
          {
            key: "bias",
            name: c.var.t("microplanning.sub_steps.bias"),
            completed: 0,
            total: 1,
          },
        ],
      }
    }

    const schoolIds = [...schools.map((s) => s.school_id), entityId]
    const estimationStatus = await this.repository.getSchoolEstimationStatus(
      c,
      microplanningId,
      schoolIds
    )

    const completedSchools = estimationStatus.length
    const totalSchools = schools.length + 1

    return {
      step_number: 1,
      title: c.var.t("microplanning.responses.target_estimation_data"),
      status: this.#calculateStatus(completedSchools, totalSchools),
      sub_steps: [
        {
          key: "bias",
          name: c.var.t("microplanning.sub_steps.bias"),
          completed: completedSchools,
          total: totalSchools,
        },
      ],
    }
  }

  async #getVaccineMaterialNeedsStep(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ): Promise<Step> {
    const villages = await this.repository.getVillagesBySubDistrict(
      c,
      microplanningId
    )

    if (villages.length === 0) {
      return {
        step_number: 2,
        title: c.var.t("microplanning.responses.vaccine_and_immunization"),
        status: this.#calculateStatus(0, 0),
        sub_steps: [
          {
            key: "non-bias",
            name: c.var.t("microplanning.sub_steps.non_bias"),
            completed: 0,
            total: 0,
          },
        ],
      }
    }

    const villageIds = villages.map((v) => v.village_id)
    const materialNeedsStatus =
      await this.repository.getVillageMaterialNeedsStatus(
        c,
        microplanningId,
        villageIds
      )

    const completedVillages = materialNeedsStatus.length
    const totalVillages = villages.length

    return {
      step_number: 2,
      title: c.var.t("microplanning.responses.vaccine_and_immunization"),
      status: this.#calculateStatus(completedVillages, totalVillages),
      sub_steps: [
        {
          key: "non-bias",
          name: c.var.t("microplanning.sub_steps.non_bias"),
          completed: completedVillages,
          total: totalVillages,
        },
      ],
    }
  }

  async #getVaccineMaterialNeedsBiasStep(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    entityId: number
  ): Promise<Step> {
    const schools = await this.repository.getSchoolsBySubDistrict(
      c,
      microplanningId
    )

    if (schools.length === 0) {
      return {
        step_number: 2,
        title: c.var.t("microplanning.responses.vaccine_and_immunization"),
        status: this.#calculateStatus(0, 1),
        sub_steps: [
          {
            key: "bias",
            name: c.var.t("microplanning.sub_steps.bias"),
            completed: 0,
            total: 1,
          },
        ],
      }
    }

    const schoolIds = [...schools.map((s) => s.school_id), entityId]
    const materialNeedsStatus =
      await this.repository.getSchoolMaterialNeedsStatus(
        c,
        microplanningId,
        schoolIds
      )

    const completedSchools = materialNeedsStatus.length
    const totalSchools = schools.length + 1

    return {
      step_number: 2,
      title: c.var.t("microplanning.responses.vaccine_and_immunization"),
      status: this.#calculateStatus(completedSchools, totalSchools),
      sub_steps: [
        {
          key: "bias",
          name: c.var.t("microplanning.sub_steps.bias"),
          completed: completedSchools,
          total: totalSchools,
        },
      ],
    }
  }

  async #checkHealthcareMapIsCreated(c: Context, microplanningId: number) {
    const checkMap = await this.repository.checkMapIsCreated(
      c,
      microplanningId
    )

    const completed = [
      checkMap.service_point_exists,
      checkMap.destination_exists,
      checkMap.route_exists,
    ].filter(Boolean).length

    const status = this.#calculateStatus(completed, 3)

    return {
      step_number: 3,
      title: c.var.t("microplanning.responses.healthcare_map"),
      status,
    }
  }

  async #getAreaPrioritizationDecisionStep(
    c: Context,
    microplanningId: number
  ): Promise<Step> {
    const title = c.var.t(
      "microplanning.responses.area_prioritization_decision"
    )

    const priorityAreas = await this.priorityAreasRepository.findPriorityAreas(
      c,
      microplanningId
    )

    const totalVillages = priorityAreas.length
    const filledVillages = priorityAreas.filter((pa) => pa.id !== null).length
    const allFilled = filledVillages === totalVillages
    const allHaveRank =
      allFilled && priorityAreas.every((pa) => pa.priority_rank !== null)

    let completed: number
    if (!allFilled || totalVillages === 0) {
      completed = 0
    } else if (!allHaveRank) {
      completed = 1
    } else {
      completed = 2
    }

    return {
      step_number: 4,
      title,
      status: this.#calculateStatus(completed, 2),
      detail: {
        filled_villages: filledVillages,
        total_villages: totalVillages,
      },
    }
  }

  async #getProblemSolutionStep(
    c: Context,
    microplanningId: number
  ): Promise<Step> {
    const title = c.var.t("microplanning.responses.problem_solution")

    const villages = await this.repository.getVillagesBySubDistrict(
      c,
      microplanningId
    )

    if (villages.length === 0) {
      return {
        step_number: 5,
        title,
        status: {
          status: "not_filled",
          completed: 0,
          total: 0,
          percentage: 0,
        },
      }
    }

    // Count villages that have at least 2 distinct problem_types filled
    const villageIds = villages.map((v) => v.village_id)
    const problemTypeCounts =
      await this.repository.getProblemSolutionVillageCounts(
        c,
        microplanningId,
        villageIds
      )

    // A village is completed when it has at least 2 distinct problem_types
    const completedVillages = problemTypeCounts.filter(
      (v) => Number(v.problem_type_count) >= 2
    ).length
    const totalVillages = villages.length

    return {
      step_number: 5,
      title,
      status: this.#calculateStatus(completedVillages, totalVillages),
      detail: {
        completed_villages: completedVillages,
        total_villages: totalVillages,
      },
    }
  }

  async #getActivityPlanStep(
    c: Context,
    microplanningId: number
  ): Promise<Step> {
    const title = c.var.t("microplanning.responses.activity_plan")

    const { total, completed } = await this.repository.getActivityPlanProgress(
      c,
      microplanningId
    )

    // If no plans exist yet, default to 2 mandatory plans as total
    const effectiveTotal = total === 0 ? 2 : total

    return {
      step_number: 6,
      title: c.var.t("microplanning.responses.activity_plan"),
      status: {
        status:
          completed >= effectiveTotal
            ? ("completed" as const)
            : ("not_filled" as const),
        completed,
        total: effectiveTotal,
        percentage:
          effectiveTotal > 0
            ? Math.ceil((completed / effectiveTotal) * 100)
            : 0,
      },
    }
  }

  #calculateStatus(completed: number, total: number): StepStatus {
    if (total === 0) {
      return {
        status: "not_filled",
        completed: 0,
        total: 0,
        percentage: 0,
      }
    }

    if (completed === 0) {
      return {
        status: "not_filled",
        completed,
        total,
        percentage: 0,
      }
    }

    if (completed < total) {
      return {
        status: "not_filled",
        completed,
        total,
        percentage: Math.ceil((completed / total) * PERCENTAGE_100),
      }
    }

    return {
      status: "completed",
      completed,
      total,
      percentage: PERCENTAGE_100,
    }
  }

  async submitMicroplanning(
    c: Context,
    subDistrictId: number,
    entityId: number
  ): Promise<SubmitMicroplanningResponse> {
    const microplanningId = c.var.microplanningId!

    const microplanning = await this.repository.getMicroplanningById(
      c,
      microplanningId
    )

    if (!microplanning || microplanning.status !== 0) {
      throw new ValidationError(
        c.var.t("validator.not_exist", {
          field: c.var.t("microplanning.label.microplanning"),
        })
      )
    }

    await this.getMicroplanningSteps(c, subDistrictId, entityId)

    await Promise.all([
      this.repository.updateMicroplanningStatus(c, microplanningId, 1),
      this.repository.updateTargetStatus(c, microplanningId, 1),
      this.repository.updateVillageEstimationStatus(c, microplanningId, 1),
      this.repository.updateSchoolEstimationStatus(c, microplanningId, 1),
      this.repository.updateMaterialNeedsStatus(c, microplanningId, 1),
      this.repository.updateServicePointStatus(c, microplanningId, 1),
      this.repository.updateDestinationStatus(c, microplanningId, 1),
      this.repository.updateRouteStatus(c, microplanningId, 1),
      this.repository.updateProblemSolutionStatus(c, microplanningId, 1),
      this.repository.updatePriorityAreasStatus(c, microplanningId, 1),
      this.activityPlanModule.updateStatus(c, 1),
    ])

    return {
      message: c.var.t("microplanning.responses.submitted"),
      microplanning_id: microplanningId,
    }
  }

  async listMicroplanningYears(
    c: Context,
    entityId: number
  ): Promise<MicroplanningYearsResponse> {
    const startYearConfig = await this.repository.getMicroplanningConfig(c, {
      key: ["start_year"],
    })
    const currentYear = new Date().getFullYear()
    const parsedStartYear = Number(startYearConfig[0]?.config)
    const startYear = Number.isInteger(parsedStartYear)
      ? parsedStartYear
      : currentYear
    const endYear = currentYear + 1

    const microplannings = await this.repository.getMicroplanningYearsByEntity(
      c,
      entityId
    )
    const microplanningByYear = new Map(
      microplannings.map((m) => [m.year, m])
    )

    const years: MicroplanningYear[] = []
    for (let year = startYear; year <= endYear; year++) {
      const microplanning = microplanningByYear.get(year)

      let status: MicroplanningYearStatus
      if (!microplanning || microplanning.status !== 1) {
        status = "not_filled"
      } else {
        const microplanningId = Number(microplanning.id)
        const [
          targetsModified,
          villageEstimationModified,
          schoolEstimationModified,
          materialNeedsModified,
          mapModified,
          priorityAreasModified,
          problemSolutionModified,
          activityPlanModified,
        ] = await Promise.all([
          this.repository.hasUnsubmittedTargets(c, microplanningId),
          this.repository.hasUnsubmittedVillageEstimation(c, microplanningId),
          this.repository.hasUnsubmittedSchoolEstimation(c, microplanningId),
          this.repository.hasUnsubmittedMaterialNeeds(c, microplanningId),
          this.repository.hasUnsubmittedMapData(c, microplanningId),
          this.repository.hasUnsubmittedPriorityAreas(c, microplanningId),
          this.repository.hasUnsubmittedProblemSolutions(c, microplanningId),
          this.repository.hasUnsubmittedActivityPlans(c, microplanningId),
        ])

        status =
          targetsModified ||
          villageEstimationModified ||
          schoolEstimationModified ||
          materialNeedsModified ||
          mapModified ||
          priorityAreasModified ||
          problemSolutionModified ||
          activityPlanModified
            ? "pending_changes"
            : "submitted"
      }

      years.push({
        year,
        status,
        label: c.var.t(`microplanning.year_status.${status}`),
        is_editable: year === currentYear || year === currentYear + 1 ? 1 : 0,
      })
    }

    years.reverse()

    return { years }
  }

  async listMicroplanningConfig(c: Context, query: MicroplanningConfigQuery) {
    const configs = await this.repository.getMicroplanningConfig(c, query)
    if (configs.length === 0) {
      throw new NotFoundError(
        c.var.t("validator.not_found", {
          field: "config",
        })
      )
    }

    const result: Record<string, unknown> = {
      program_id: configs[0]?.program_id,
    }

    for (const row of configs) {
      result[row.key] = Array.isArray(row.config)
        ? row.config?.map((cfg) => ({
            ...cfg,
            name: c.var.t(`${row.key}.label.${cfg.name}`),
          }))
        : row.config
    }

    return result
  }

  async listSchools(c: Context, params: MicroplanningSchoolsQuery) {
    const microplanningId = c.var.microplanningId!
    const { list, total } = await this.repository.getSchoolsByMicroplanningId(
      c,
      microplanningId,
      params
    )

    return new PaginatedResponse(params, list, total)
  }

  async getSummaryTargetAndRisk(
    c: Context
  ): Promise<SummaryTargetAndRiskResponse> {
    const microplanningId = c.var.microplanningId!
    const subDistrictId = Number(c.var.userEntity?.sub_district_id || 0)

    const [
      targetsSummary,
      communityHealthWorkerTotal,
      vaccinatorNeeds,
      immunizationServiceDays,
      priorityAreas,
    ] = await Promise.all([
      this.targetsModule.getSummaryTargetsMicroplanByIdealDate(
        c,
        { type: "non-bias" },
        subDistrictId
      ),
      this.repository.getCommunityHealthWorkerTotalAdditionalNeeds(
        c,
        microplanningId
      ),
      this.repository.getVaccinatorNeeds(c, microplanningId),
      this.repository.getImmunizationServiceDays(c, microplanningId),
      this.priorityAreasRepository.findPriorityAreas(c, microplanningId),
    ])

    // Calculate risk counts from priority areas using calculated values
    const totalVillagesByRisk = { low: 0, medium: 0, high: 0 }
    for (const area of priorityAreas) {
      if (area.calculated?.risk) {
        const risk = area.calculated.risk.toLowerCase() as
          | "low"
          | "medium"
          | "high"
        if (risk in totalVillagesByRisk) {
          totalVillagesByRisk[risk]++
        }
      }
    }

    // Map target summary data to TargetGroupCount[] format
    const targetGroupsWithLabels: TargetGroupCount[] = targetsSummary.data.map(
      (item) => ({
        target_group_id: item.id ?? 0,
        label: item.name ?? "",
        count: Number(item.qty),
      })
    )

    return {
      number_of_targets: targetGroupsWithLabels,
      community_health_worker: {
        total_additional_needs: communityHealthWorkerTotal,
      },
      vaccinator_needs: {
        facility_based_service:
          vaccinatorNeeds.additional_facility_vaccinator_service ?? 0,
        outreach_service:
          vaccinatorNeeds.additional_outreach_vaccinator_service ?? 0,
      },
      immunization_service_days: {
        august: immunizationServiceDays.august,
        november: immunizationServiceDays.november,
      },
      total_villages_by_risk: totalVillagesByRisk,
    }
  }
}
