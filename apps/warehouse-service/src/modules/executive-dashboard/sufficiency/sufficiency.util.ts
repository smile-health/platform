import moment from "moment"
import {
  // Types from schema
  SufficiencyArea,
  SufficiencyMaps,
  SufficiencyMapsDataset,
  SufficiencyOverview,
  SufficiencyMonthlyComparison,
  SufficiencyMonthlyComparisonItem,
  SufficiencyStockData,
  SufficiencyStockItem,
  SufficiencyTop10Materials,
  SufficiencyTop10MaterialItem,
  SufficiencyOverviewResult,
  SufficiencyTop10MaterialsResultItem,
  SufficiencyMapsResult,
  SufficiencyMonthlyComparisonResult,
  SufficiencyTop10MaterialsResult,
  SufficiencyStockResult,
  SufficiencyMapItem,
  SufficiencyCriticalOverviewResult,
} from "./sufficiency.schema.js"
import { round } from "@smile-health/lib/utils.js"

// Type aliases for better readability
export type StatusGroups = {
  [status: string]: Record<string, SufficiencyMapItem>
}

// Maps Data Builders
export function buildMapsData(
  data: SufficiencyMapsResult,
  provinceId: number | undefined | null,
  provinceName: string | undefined
): SufficiencyMaps {
  const area: SufficiencyArea = {
    id: provinceId ? provinceId : 0,
    name: provinceId ? provinceName || "" : "Nasional",
  }

  const statusGroups: StatusGroups = {
    insufficient: {},
    at_risk: {},
    sufficient: {},
  }

  const notAvailableRegions: Set<SufficiencyMapItem> = new Set()

  // Group data by region and status
  data.forEach((item) => {
    const regionId = item.id
    const regionName = item.name

    if (!statusGroups[item.status]) {
      statusGroups[item.status] = {}
    }

    const statusGroup = statusGroups[item.status]!
    statusGroup[regionId] = {
      id: regionId,
      name: regionName,
      total: item.total,
      insufficient: item.insufficient,
      at_risk: item.at_risk,
      sufficient: item.sufficient,
    }
  })

  // Find regions with no data
  const allRegions = new Set<SufficiencyMapItem>()
  data.forEach((item) => {
    allRegions.add({
      id: item.id,
      name: item.name,
      total: item.total,
      insufficient: item.insufficient,
      at_risk: item.at_risk,
      sufficient: item.sufficient,
    })
  })

  allRegions.forEach((region) => {
    const hasData = ["insufficient", "at_risk", "sufficient"].some(
      (status) => statusGroups[status]?.[region.id]
    )
    if (!hasData) {
      notAvailableRegions.add(region)
    }
  })

  const dataset: SufficiencyMapsDataset = {
    not_available: Array.from(notAvailableRegions),
    insufficient: Object.values(statusGroups.insufficient || {}),
    at_risk: Object.values(statusGroups.at_risk || {}),
    sufficient: Object.values(statusGroups.sufficient || {}),
  }

  return {
    area,
    dataset,
  }
}

// Overview Data Builder
export function buildOverviewData(
  data: SufficiencyOverviewResult,
  criticalOverviewData: SufficiencyCriticalOverviewResult
): SufficiencyOverview {
  const record = data[0] || {}
  const criticalOverviewRecord = criticalOverviewData[0] || {}

  const medicine =
    record.medicine_total && record.medicine_sufficient
      ? (record.medicine_sufficient / record.medicine_total) * 100
      : 0
  const vaccine =
    record.vaccine_total && record.vaccine_sufficient
      ? (record.vaccine_sufficient / record.vaccine_total) * 100
      : 0
  const consumable =
    record.consumable_total && record.consumable_sufficient
      ? (record.consumable_sufficient / record.consumable_total) * 100
      : 0
  const medical_consumable =
    record.medical_consumable_total && record.medical_consumable_sufficient
      ? (record.medical_consumable_sufficient /
          record.medical_consumable_total) *
        100
      : 0

  return {
    stock_critical_materials:
      criticalOverviewRecord.stock_critical_materials || 0,
    consumable: round(consumable),
    vaccine: round(vaccine),
    medicine: round(medicine),
    medical_consumable: round(medical_consumable),
  }
}

// Monthly Comparison Builder
export function buildMonthlyComparison(
  data: SufficiencyMonthlyComparisonResult,
  startPeriod: string,
  endPeriod: string
): SufficiencyMonthlyComparison {
  const dataset: SufficiencyMonthlyComparisonItem[] = data.map((item) => ({
    id: item.period,
    label: moment(item.period, "YYYY-MM").format("MMM YY"),
    value: round(item.value),
  }))

  const startLabel = moment(startPeriod, "YYYY-MM").format("MMM YYYY")
  const endLabel = moment(endPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_12_months: `${startLabel} to ${endLabel}`,
    dataset,
  }
}

// Top 10 Materials Builder
export function buildTop10Materials(
  data: SufficiencyTop10MaterialsResult,
  currentPeriod: string
): SufficiencyTop10Materials {
  const groupedByStatus: Record<string, SufficiencyTop10MaterialsResultItem[]> =
    {
      insufficient: [],
      at_risk: [],
      sufficient: [],
    }

  // Group by status
  data?.forEach((item) => {
    const status = item.status
    if (groupedByStatus[status]) {
      groupedByStatus[status]!.push(item)
    }
  })

  // Transform and rank each category
  const transformAndRank = (
    items: SufficiencyTop10MaterialsResultItem[],
    sortByMode: "asc" | "desc" = "desc"
  ): SufficiencyTop10MaterialItem[] => {
    return items
      .sort((a, b) =>
        sortByMode === "desc"
          ? b.consumption_value_agg - a.consumption_value_agg
          : a.consumption_value_agg - b.consumption_value_agg
      )
      .slice(0, 10)
      .map((item, index) => ({
        row: index + 1,
        label: item.name,
        value: round(item.consumption_value_agg),
      }))
  }

  return {
    last_month: moment(currentPeriod, "YYYY-MM").format("MMM YYYY"),
    dataset: {
      insufficent: transformAndRank(groupedByStatus.insufficient || [], "desc"),
      risk: transformAndRank(groupedByStatus.at_risk || [], "asc"),
      sufficient: transformAndRank(groupedByStatus.sufficient || [], "desc"),
    },
  }
}

// Stock Data Builder (for both stock out and stock max)
export function buildStockData(
  data: SufficiencyStockResult,
  currentPeriod: string
): SufficiencyStockData {
  const dataset: SufficiencyStockItem[] = data.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
  }))

  return {
    this_month: moment(currentPeriod, "YYYY-MM").format("MMM YYYY"),
    dataset,
  }
}

// Helper function to format month label
export function formatMonthLabel(period: string): string {
  return moment(period, "YYYY-MM").format("MMM YYYY")
}
