import { FLAG } from "@/common/constants/common.js"
import { BadRequestError, ValidationError } from "@smile-health/lib/error.js"
import { Context } from "hono"
import { PriorityAreasRepository } from "./priority-areas.repository.js"
import {
  CreatePriorityArea,
  MAP_RISK,
  UpdatePriorityArea,
  UpdateRankings,
} from "./priority-areas.schema.js"

export class PriorityAreasModule {
  constructor(private readonly repository: PriorityAreasRepository) {}

  async getPriorityAreas(
    c: Context,
    villageId?: number,
    previousYear?: number
  ) {
    const { t } = c.var
    const microplanningId =
      previousYear === FLAG.TRUE
        ? c.var.prevMicroplanningId!
        : c.var.microplanningId!

    const priorityAreas = await this.repository.findPriorityAreas(
      c,
      microplanningId,
      {
        villageId,
      }
    )

    return priorityAreas.map((area) => {
      const has_completed = area.id ? 1 : 0
      let data = null

      if (has_completed && area.calculated) {
        data = {
          id: area.id,
          target_newborn_baby: area.target_newborn_baby,
          target_surviving_infants: area.target_surviving_infants,
          achievement_bcg: area.achievement_bcg,
          achievement_dpt1: area.achievement_dpt1,
          achievement_dpt3: area.achievement_dpt3,
          achievement_mr1: area.achievement_mr1,
          achievement_mr2: area.achievement_mr2,
          achievement_dpt4: area.achievement_dpt4,
          achievement_prev_dpt3: area.achievement_prev_dpt3,
          achievement_prev_mr1: area.achievement_prev_mr1,
          has_supporting_condition: area.has_supporting_condition,
          has_pd3i_case: area.has_pd3i_case,
          priority_rank: area.priority_rank,
          status: area.status,
          calculated: {
            lo_raw: area.calculated.lo_raw,
            lo_rate: area.calculated.lo_rate,
            do_bayi_dpt13_raw: area.calculated.do_bayi_dpt13_raw,
            do_bayi_dpt13_rate: area.calculated.do_bayi_dpt13_rate,
            do_bayi_dpt1cr1_raw: area.calculated.do_bayi_dpt1cr1_raw,
            do_bayi_dpt1cr1_rate: area.calculated.do_bayi_dpt1cr1_rate,
            do_baduta_dpt34_raw: area.calculated.do_baduta_dpt34_raw,
            do_baduta_dpt34_rate: area.calculated.do_baduta_dpt34_rate,
            do_baduta_cr12_raw: area.calculated.do_baduta_cr12_raw,
            do_baduta_cr12_rate: area.calculated.do_baduta_cr12_rate,
            criteria_lo: {
              code: area.calculated.criteria_lo,
              label: t(`microplanning.label.${area.calculated.criteria_lo}`),
            },
            criteria_do: {
              code: area.calculated.criteria_do,
              label: t(`microplanning.label.${area.calculated.criteria_do}`),
            },
            category: area.calculated.category,
            risk: area.calculated.risk,
          },
        }
      }

      return {
        village_id: area.village_id,
        village_name: area.village_name,
        has_completed,
        data,
      }
    })
  }

  async create(c: Context, item: CreatePriorityArea) {
    const microplanningId = c.var.microplanningId!

    const dbData = {
      microplanning_id: microplanningId,
      village_id: item.village_id,
      target_bayi_lahir: item.target_newborn_baby ?? null,
      target_surviving_infants: item.target_surviving_infants ?? null,
      achievement_bcg: item.achievement_bcg ?? null,
      achievement_dpt1: item.achievement_dpt1 ?? null,
      achievement_dpt3: item.achievement_dpt3 ?? null,
      achievement_mr1: item.achievement_mr1 ?? null,
      achievement_mr2: item.achievement_mr2 ?? null,
      achievement_dpt4: item.achievement_dpt4 ?? null,
      achievement_prev_dpt3: item.achievement_prev_dpt3 ?? null,
      achievement_prev_mr1: item.achievement_prev_mr1 ?? null,
      has_supporting_condition:
        item.has_supporting_condition != null
          ? item.has_supporting_condition
            ? 1
            : 0
          : null,
      has_pd3i_case:
        item.has_pd3i_case != null ? (item.has_pd3i_case ? 1 : 0) : null,
    }

    try {
      await this.repository.create(c, dbData)
      return { message: "success" }
    } catch (error: unknown) {
      const err = error as { code: string }
      if (err?.code === "ER_DUP_ENTRY")
        throw new ValidationError(c.var.t("common.duplicate"))
      throw new BadRequestError()
    }
  }

  async update(c: Context, id: number, item: UpdatePriorityArea) {
    const dbData = {
      village_id: item.village_id,
      target_bayi_lahir: item.target_newborn_baby ?? null,
      target_surviving_infants: item.target_surviving_infants ?? null,
      achievement_bcg: item.achievement_bcg ?? null,
      achievement_dpt1: item.achievement_dpt1 ?? null,
      achievement_dpt3: item.achievement_dpt3 ?? null,
      achievement_mr1: item.achievement_mr1 ?? null,
      achievement_mr2: item.achievement_mr2 ?? null,
      achievement_dpt4: item.achievement_dpt4 ?? null,
      achievement_prev_dpt3: item.achievement_prev_dpt3 ?? null,
      achievement_prev_mr1: item.achievement_prev_mr1 ?? null,
      has_supporting_condition:
        item.has_supporting_condition != null
          ? item.has_supporting_condition
            ? 1
            : 0
          : null,
      has_pd3i_case:
        item.has_pd3i_case != null ? (item.has_pd3i_case ? 1 : 0) : null,
    }

    await this.repository.update(c, id, dbData)
    return { message: "success" }
  }

  async getRankings(c: Context) {
    const microplanningId = c.var.microplanningId!

    const areas = await this.repository.findPriorityAreas(c, microplanningId, {
      hasCompletedOnly: true,
      orderBy: "priority_rank",
    })

    const hasNullRank = areas.some((a) => a.priority_rank === null)
    const isConfirmed = !hasNullRank

    let villages = areas.map((area) => {
      const criteriaLoCode: string = area.calculated?.criteria_lo ?? ""
      const criteriaDoCode: string = area.calculated?.criteria_do ?? ""
      const criteria = criteriaLoCode + criteriaDoCode

      return {
        id: area.id,
        village_id: area.village_id,
        village_name: area.village_name,
        suggested_rank: 0,
        priority_rank: area.priority_rank,
        category: area.calculated?.category,
        criteria,
        target_surviving_infants: area.target_surviving_infants,
        has_pd3i_case: area.has_pd3i_case,
        has_supporting_condition: area.has_supporting_condition,
        risk: area.calculated?.risk,
        calculated: {
          lo_rate: area.calculated?.lo_rate,
          lo_raw: area.calculated?.lo_raw,
        },
      }
    })

    if (hasNullRank) {
      villages.sort((a, b) => {
        const aCat = a.category ?? 0
        const bCat = b.category ?? 0
        if (bCat !== aCat) return bCat - aCat

        const aRisk = MAP_RISK[a.risk ?? ""] ?? 0
        const bRisk = MAP_RISK[b.risk ?? ""] ?? 0
        if (bRisk !== aRisk) return bRisk - aRisk

        const aTarget = a.target_surviving_infants ?? 0
        const bTarget = b.target_surviving_infants ?? 0
        if (bTarget !== aTarget) return bTarget - aTarget

        const aPd3i = a.has_pd3i_case ? 1 : 0
        const bPd3i = b.has_pd3i_case ? 1 : 0
        return bPd3i - aPd3i
      })
    }

    villages = villages.map((v, index) => ({
      ...v,
      suggested_rank: index + 1,
    }))

    return { is_confirmed: Number(isConfirmed), villages }
  }

  async updateRankings(c: Context, rankings: UpdateRankings) {
    await this.repository.resetRankings(c)

    try {
      for (const item of rankings) {
        await this.repository.updateRanking(c, item.id, item.priority_rank)
      }
      return { message: "success" }
    } catch (error: unknown) {
      const err = error as { code: string }
      if (err?.code === "ER_DUP_ENTRY")
        throw new ValidationError(c.var.t("common.duplicate"))
      throw new BadRequestError()
    }
  }

  async getSummary(c: Context) {
    const { t } = c.var
    const microplanningId = c.var.microplanningId!

    const areas = await this.repository.findPriorityAreas(c, microplanningId, {
      hasCompletedOnly: true,
    })

    const [totalVillages, completedVillages] = await Promise.all([
      this.repository.countAssignedVillages(c, microplanningId),
      this.repository.countCompletedVillages(c, microplanningId),
    ])

    let totalNewbornBaby = 0
    let totalSurvivingInfants = 0
    let totalBcg = 0
    let totalDpt1 = 0
    let totalDpt3 = 0
    let totalMr1 = 0
    let totalMr2 = 0
    let totalDpt4 = 0
    let totalPrevDpt3 = 0
    let totalPrevMr1 = 0
    let totalLo = 0
    let totalDoRaw = 0
    const categoryRiskCount: Record<
      string,
      { category: number | null; risk: string | null; count: number }
    > = {}

    for (const area of areas) {
      totalNewbornBaby += area.target_newborn_baby ?? 0
      totalSurvivingInfants += area.target_surviving_infants ?? 0
      totalBcg += area.achievement_bcg ?? 0
      totalDpt1 += area.achievement_dpt1 ?? 0
      totalDpt3 += area.achievement_dpt3 ?? 0
      totalMr1 += area.achievement_mr1 ?? 0
      totalMr2 += area.achievement_mr2 ?? 0
      totalDpt4 += area.achievement_dpt4 ?? 0
      totalPrevDpt3 += area.achievement_prev_dpt3 ?? 0
      totalPrevMr1 += area.achievement_prev_mr1 ?? 0

      totalLo += area.calculated?.lo_raw ?? 0
      totalDoRaw +=
        (area.calculated?.do_bayi_dpt13_raw ?? 0) +
        (area.calculated?.do_bayi_dpt1cr1_raw ?? 0) +
        (area.calculated?.do_baduta_dpt34_raw ?? 0) +
        (area.calculated?.do_baduta_cr12_raw ?? 0)

      const cat = area.calculated?.category
      const risk = area.calculated?.risk?.toLowerCase()
      const key = `${cat}_${risk ?? "unknown"}`
      if (!categoryRiskCount[key]) {
        categoryRiskCount[key] = { category: cat, risk, count: 0 }
      }
      categoryRiskCount[key].count++
    }

    const predefinedCombinations: { category: number; risk: string }[] = [
      { category: 1, risk: "low" },
      { category: 2, risk: "medium" },
      { category: 2, risk: "high" },
      { category: 3, risk: "medium" },
      { category: 3, risk: "high" },
      { category: 4, risk: "high" },
    ]

    const categoryDistribution = predefinedCombinations.map((combo) => {
      const key = `${combo.category}_${combo.risk}`
      const item = categoryRiskCount[key]
      return {
        category: combo.category,
        risk: combo.risk,
        risk_label: t(`microplanning.label.${combo.risk}`),
        count: item?.count ?? 0,
      }
    })

    return {
      area_priority_order: {
        category_distribution: categoryDistribution,
      },
      number_of_target: {
        total_newborn_baby: totalNewbornBaby,
        total_surviving_infants: totalSurvivingInfants,
      },
      number_of_achievements: {
        one_year_ago: {
          bcg: totalBcg,
          dpt1: totalDpt1,
          dpt3: totalDpt3,
          mr1: totalMr1,
          mr2: totalMr2,
          dpt4: totalDpt4,
        },
        two_years_ago: {
          dpt3: totalPrevDpt3,
          mr1: totalPrevMr1,
        },
      },
      left_out: {
        total_lo: totalLo,
      },
      drop_out: {
        total_do: totalDoRaw,
      },
      progress: {
        completed_villages: completedVillages,
        total_villages: totalVillages,
      },
    }
  }
}
