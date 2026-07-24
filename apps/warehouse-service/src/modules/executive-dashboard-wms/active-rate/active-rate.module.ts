import { Context } from "hono"
import { ActiveRateRepository } from "./active-rate.repository.js"
import {
  ActiveRateQueryParams,
  ActiveRateResponse,
  MapDatasetItem,
  MonthlyDatasetItem,
  RankingDatasetItem,
} from "./active-rate.schema.js"
import moment from "moment"

export class ActiveRateModule {
  constructor(private readonly repository: ActiveRateRepository) {}

  async getActiveRateData(
    c: Context,
    params: ActiveRateQueryParams
  ): Promise<ActiveRateResponse> {
    const [lastUpdated, latestPeriod, latestWeeklyPeriod] = await Promise.all([
      this.repository.getLastUpdated(c),
      this.repository.getLatestPeriod(c),
      this.repository.getLatestWeeklyPeriod(c),
    ])

    const completedPeriods = Array.from({ length: 12 }, (_, index) =>
      moment()
        .subtract(12 - index, "months")
        .format("YYYY-MM")
    )

    const latestCompletedPeriod =
      completedPeriods.length > 0
        ? completedPeriods[completedPeriods.length - 1]
        : undefined
    const effectivePeriod =
      params.period ?? latestCompletedPeriod ?? latestPeriod
    const effectiveWeeklyPeriod = params.period ?? latestWeeklyPeriod
    const weeklyEndMoment = moment(
      effectiveWeeklyPeriod,
      "YYYY-MM-DD",
      true
    ).isValid()
      ? moment(effectiveWeeklyPeriod, "YYYY-MM-DD").subtract(1, "day")
      : moment(latestWeeklyPeriod, "YYYY-MM-DD").subtract(1, "day")
    const weeklyStartPeriod = weeklyEndMoment
      .clone()
      .subtract(7, "day")
      .format("YYYY-MM-DD")
    const weeklyEndPeriod = weeklyEndMoment.format("YYYY-MM-DD")

    const [mapRaw, rankingRaw, monthlyRaw] = await Promise.all([
      this.repository.getMapDataWeekly(
        c,
        params,
        weeklyStartPeriod,
        weeklyEndPeriod
      ),
      this.repository.getRankingByProvince(c, params, effectivePeriod),
      this.repository.getMonthlyComparison(c, params, completedPeriods),
    ])

    // Build maps dataset
    const mapDataset: MapDatasetItem[] = mapRaw.map((row) => {
      const id = params.province_id
        ? Number(row.hf_city_id ?? 0)
        : Number(row.hf_province_id ?? 0)
      const name = params.province_id
        ? (row.hf_city_name ?? "Unknown")
        : (row.hf_province_name ?? "Unknown")
      const value = Number(row.total_active)
      const total = Number(row.total_registered)
      const percent = total > 0 ? Math.round((value / total) * 10000) / 100 : 0
      const tooltipOf = c.var.t("active_rate.tooltip.of", "of")
      const tooltipEntities = c.var.t(
        "active_rate.tooltip.entities",
        "entities"
      )
      const tooltip = `${percent} % (${value.toLocaleString("id-ID")} ${tooltipOf} ${total.toLocaleString("id-ID")} ${tooltipEntities})`

      return { id, name, value, total, percent, tooltip }
    })

    // Build monthly comparison
    const monthlyMap = new Map(monthlyRaw.map((m) => [m.period, m]))
    const monthlyDataset: MonthlyDatasetItem[] = completedPeriods.map(
      (period) => {
        const m = monthlyMap.get(period)
        const value = m
          ? Number(m.total_registered) > 0
            ? Math.round(
                (Number(m.total_active) / Number(m.total_registered)) * 10000
              ) / 100
            : null
          : null
        const momentPeriod = moment(period, "YYYY-MM")
        return {
          id: period,
          label: momentPeriod.format("MMM YY"),
          value,
        }
      }
    )

    // Compute avg from dataset aggregate with formula:
    // ((total value / jumlah total) * 10000) / 100
    const totalValue = mapDataset.reduce((sum, item) => sum + item.value, 0)
    const totalOverall = mapDataset.reduce((sum, item) => sum + item.total, 0)
    const avg =
      totalOverall > 0
        ? Math.round((totalValue / totalOverall) * 100 * 10) / 10
        : 0

    const firstPeriod = completedPeriods[0]
    const lastPeriod = completedPeriods[completedPeriods.length - 1]
    const last12MonthsLabel =
      firstPeriod && lastPeriod
        ? `${moment(firstPeriod, "YYYY-MM").format("MMM YYYY")} to ${moment(lastPeriod, "YYYY-MM").format("MMM YYYY")}`
        : ""

    // Build ranking and exclude zero percentages
    const rankingWithValue = rankingRaw
      .map((row) => {
        const total = Number(row.total_registered)
        const active = Number(row.total_active)
        const value = total > 0 ? Math.round((active / total) * 10000) / 100 : 0
        return {
          label: row.area_name,
          value,
        }
      })
      .filter((item) => item.value > 0)

    const highest: RankingDatasetItem[] = rankingWithValue
      .slice(0, 10)
      .map((row, idx) => ({
        row: idx + 1,
        label: row.label,
        value: row.value,
      }))

    const lowest: RankingDatasetItem[] = [...rankingWithValue]
      .reverse()
      .slice(0, 10)
      .map((row, idx) => ({
        row: idx + 1,
        label: row.label,
        value: row.value,
      }))

    const lastMonthLabel = moment(effectivePeriod, "YYYY-MM").format("MMM YYYY")

    // Determine area name
    let areaName = "Nasional"
    if (params.province_id && mapRaw.length > 0) {
      const firstRow = mapRaw[0]
      areaName = firstRow?.hf_province_name ?? "Unknown"
    }

    return {
      last_updated: lastUpdated,
      data: {
        maps: {
          area: {
            id: params.province_id ? Number(params.province_id) : 0,
            name: areaName,
          },
          dataset: mapDataset,
        },
        avg,
        monthly_comparison: {
          last_12_months: last12MonthsLabel,
          dataset: monthlyDataset,
        },
        highest: {
          last_month: lastMonthLabel,
          dataset: highest,
        },
        lowest: {
          last_month: lastMonthLabel,
          dataset: lowest,
        },
      },
    }
  }
}
