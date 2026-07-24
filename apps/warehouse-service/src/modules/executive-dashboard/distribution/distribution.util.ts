import { Context } from "hono"
import {
  FacilityDistributionDataDTO,
  FacilityOverviewDataDTO,
  MapItemDTO,
  MapsDataDTO,
  OverviewItemDTO,
  ActiveRateDataDTO,
  ActiveRateMonthlyDataDTO,
  ActiveRateRankingDataDTO,
  MonthlyComparisonDTO,
  RankingDTO,
  LeadTimeMapsDataDTO,
  LeadTimeMonthlyDataDTO,
  LeadTimeMostDeliveryDataDTO,
  LeadTimeMonthlyComparisonDTO,
  LeadTimeMostDeliveryDTO,
  LeadTimeMapItemDTO,
  LeadTimeMonthlyComparisonItemDTO,
  LastMileMapsDataDTO,
  LastMileMonthlyDataDTO,
  LastMileDistributionDataDTO,
  LastMileMonthlyLastMileDataDTO,
  LastMileMonthlyComparisonDTO,
  LastMileMonthlyComparisonItemDTO,
  LastMileMonthlyLastMileDTO,
  LastMileMonthlyLastMileItemDTO,
  LastMileDistributionItemDTO,
  YearlyComparisonItemDTO,
  YearlyComparisonDTO,
} from "./distribution.schema.js"
import moment from "moment"
import { round } from "@smile-health/lib/utils.js"

export const buildMapsData = (
  c: Context,
  data: FacilityDistributionDataDTO[],
  provinceId?: number | null,
  provinceName?: string
): MapsDataDTO => {
  const dataset: MapItemDTO[] = data.map((item) => {
    const percent = item.total > 0 ? (item.value / item.total) * 100 : 0
    const roundedPercent = round(percent)

    return {
      id: parseInt(item.id || "0"),
      name: item.name,
      value: item.value,
      total: item.total,
      percent: roundedPercent,
      tooltip: `${roundedPercent}% (Total ${c.var.t("common.healthcare_facility")} Implementor: ${item.value.toLocaleString()} of ${item.total.toLocaleString()} ${c.var.t("common.healthcare_facility")})`,
    }
  })

  // Determine area based on province_id
  const area = provinceId
    ? {
        id: provinceId,
        name: provinceName || "Province",
      }
    : {
        id: 0,
        name: "Indonesia",
      }

  return {
    area,
    dataset,
  }
}

export const buildOverviewData = (
  c: Context,
  overviewData: FacilityOverviewDataDTO | null
): OverviewItemDTO[] => {
  return [
    {
      id: 1,
      label: c.var.t("common.province"),
      value: overviewData?.total_province_implementor || 0,
      total: overviewData?.total_province || 0,
    },
    {
      id: 2,
      label: c.var.t("common.district"),
      value: overviewData?.total_regency_implementor || 0,
      total: overviewData?.total_regency || 0,
    },
    {
      id: 3,
      label: c.var.t("common.healthcare_facility"),
      value: overviewData?.total_facility_implementor || 0,
      total: overviewData?.total_facility || 0,
    },
  ]
}

// Active Rate Utility Functions
export const buildActiveRateMapsData = (
  c: Context,
  data: ActiveRateDataDTO[],
  provinceId?: number | null,
  provinceName?: string
): MapsDataDTO => {
  const dataset: MapItemDTO[] = data.map((item) => {
    const roundedPercent = round(item.percent)

    return {
      id: parseInt(item.id || "0"),
      name: item.name,
      value: item.value,
      total: item.total,
      percent: roundedPercent,
      tooltip: `${roundedPercent} % (${item.value.toLocaleString()} of ${item.total.toLocaleString()} ${c.var.t("common.entity")})`,
    }
  })

  // Determine area based on province_id
  const area = provinceId
    ? {
        id: provinceId,
        name: provinceName || "Province",
      }
    : {
        id: 0,
        name: "Indonesia",
      }

  return {
    area,
    dataset,
  }
}

export const buildActiveRateMonthlyComparison = (
  c: Context,
  data: ActiveRateMonthlyDataDTO[]
): MonthlyComparisonDTO => {
  if (data.length === 0) {
    return {
      last_12_months: "",
      dataset: [],
    }
  }

  const dataset = data.map((item) => {
    const date = moment(item.period, "YYYY-MM")
    return {
      id: item.period,
      label: date.format("MMM YY"),
      value: round(item.active_rate),
    }
  })

  const firstPeriod = moment(data[0]?.period || "", "YYYY-MM").format(
    "MMM YYYY"
  )
  const lastPeriod = moment(
    data[data.length - 1]?.period || "",
    "YYYY-MM"
  ).format("MMM YYYY")

  return {
    last_12_months: `${firstPeriod} ${c.var.t("common.to")} ${lastPeriod}`,
    dataset,
  }
}

export const buildActiveRateRanking = (
  data: ActiveRateRankingDataDTO[],
  currentPeriod: string
): RankingDTO => {
  const dataset = data.map((item, index) => ({
    row: index + 1,
    label: item.name,
    value: round(item.active_rate),
  }))

  const lastMonth = moment(currentPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_month: lastMonth,
    dataset,
  }
}

// Lead Time Utility Functions
export const buildLeadTimeMapsData = (
  c: Context,
  data: LeadTimeMapsDataDTO[],
  provinceId?: number | null,
  provinceName?: string
): MapsDataDTO => {
  const dataset: LeadTimeMapItemDTO[] = data.map((item) => {
    return {
      id: item.id,
      name: item.name,
      value: Math.ceil(item.avg_duration),
      tooltip: `Avg. Delivery Lead Time: ${Math.ceil(item.avg_duration)} ${c.var.t("common.day")}`,
    }
  })

  // Determine area based on province_id
  const area = provinceId
    ? {
        id: provinceId,
        name: provinceName || "Province",
      }
    : {
        id: 0,
        name: "Indonesia",
      }

  return {
    area,
    dataset: dataset as MapItemDTO[], // Type assertion to handle different map item structures
  }
}

export const buildLeadTimeMonthlyComparison = (
  c: Context,
  data: LeadTimeMonthlyDataDTO[],
  startPeriod: string,
  endPeriod: string
): LeadTimeMonthlyComparisonDTO => {
  // Create a map of existing data for quick lookup
  const dataMap = new Map<string, LeadTimeMonthlyDataDTO>()
  data.forEach((item) => {
    dataMap.set(item.period, item)
  })

  // Generate all months from start to end period
  const dataset: LeadTimeMonthlyComparisonItemDTO[] = []
  const current = moment(startPeriod, "YYYY-MM")
  const end = moment(endPeriod, "YYYY-MM")

  while (current.isSameOrBefore(end)) {
    const period = current.format("YYYY-MM")
    const existingData = dataMap.get(period)

    dataset.push({
      id: period,
      label: current.format("MMM YY"),
      value: Math.ceil(existingData?.avg_duration || 0),
    })

    current.add(1, "month")
  }

  const firstPeriodFormatted = moment(startPeriod, "YYYY-MM").format("MMM YYYY")
  const lastPeriodFormatted = moment(endPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_12_months: `${firstPeriodFormatted} ${c.var.t("common.to")} ${lastPeriodFormatted}`,
    dataset,
  }
}

export const buildLeadTimeMostDelivery = (
  data: LeadTimeMostDeliveryDataDTO[],
  currentPeriod: string,
  provinceId?: number | null
): LeadTimeMostDeliveryDTO => {
  const dataset = data.map((item, index) => ({
    id: index + 1,
    label: provinceId
      ? item.name + " - " + item.customer_regency_name
      : item.name,
    value: provinceId ? item.avg_duration : item.count,
  }))

  const lastMonth = moment(currentPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_month: lastMonth,
    dataset,
  }
}

// Last Mile Utility Functions
export const buildLastMileMapsData = (
  data: LastMileMapsDataDTO[],
  provinceId?: number | null,
  provinceName?: string
): MapsDataDTO => {
  const dataset = data.map((item) => ({
    id: item.id,
    name: item.name,
    distribution: Math.round(item.distribution),
    receive: Math.round(item.receive),
  }))

  // Determine area based on province_id
  const area = provinceId
    ? {
        id: provinceId,
        name: provinceName || "Province",
      }
    : {
        id: 0,
        name: "Indonesia",
      }

  return {
    area,
    dataset,
  }
}

export const buildLastMileMonthlyComparison = (
  c: Context,
  data: LastMileMonthlyDataDTO[],
  startPeriod: string,
  endPeriod: string
): LastMileMonthlyComparisonDTO => {
  // Create a map of existing data for quick lookup
  const dataMap = new Map<string, LastMileMonthlyDataDTO>()
  data.forEach((item) => {
    dataMap.set(item.period, item)
  })

  // Generate all months from start to end period
  const dataset: LastMileMonthlyComparisonItemDTO[] = []
  const current = moment(startPeriod, "YYYY-MM")
  const end = moment(endPeriod, "YYYY-MM")

  while (current.isSameOrBefore(end)) {
    const period = current.format("YYYY-MM")
    const existingData = dataMap.get(period)

    dataset.push({
      id: period,
      label: current.format("MMM YY"),
      receive: Math.round(existingData?.receive || 0),
      distribution: Math.round(existingData?.distribution || 0),
      last_mile: Math.round(existingData?.distribution || 0),
    })

    current.add(1, "month")
  }

  const firstPeriodFormatted = moment(startPeriod, "YYYY-MM").format("MMM YYYY")
  const lastPeriodFormatted = moment(endPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_12_months: `${firstPeriodFormatted} ${c.var.t("common.to")} ${lastPeriodFormatted}`,
    dataset,
  }
}

export const buildLastMileDistribution = (
  c: Context,
  data: LastMileDistributionDataDTO[]
): LastMileDistributionItemDTO[] => {
  // Group material types
  const materialGroups: Record<string, number> = {}

  data.forEach((item) => {
    const materialType = item.material_type_name.toLowerCase()

    if (materialType === "vaccine") {
      materialGroups["vaccine"] =
        (materialGroups["vaccine"] || 0) + item.distribution
    } else if (materialType === "medicine") {
      materialGroups["medicine"] =
        (materialGroups["medicine"] || 0) + item.distribution
    } else if (materialType === "non_medical_devices") {
      materialGroups["consumable"] =
        (materialGroups["consumable"] || 0) + item.distribution
    } else if (materialType === "medical_devices") {
      materialGroups["medical_consumable"] =
        (materialGroups["medical_consumable"] || 0) + item.distribution
    }
  })

  // Convert to array with proper IDs
  const result: LastMileDistributionItemDTO[] = []
  let id = 1

  if (materialGroups["vaccine"] !== undefined) {
    result.push({
      id: id++,
      label: c.var.t("material_type.label.vaccine"),
      last_mile: Math.round(materialGroups["vaccine"]),
    })
  }

  if (materialGroups["medicine"] !== undefined) {
    result.push({
      id: id++,
      label: c.var.t("material_type.label.medicine"),
      last_mile: Math.round(materialGroups["medicine"]),
    })
  }

  if (materialGroups["consumable"] !== undefined) {
    result.push({
      id: id++,
      label: c.var.t("material_type.label.non_medical_devices"),
      last_mile: Math.round(materialGroups["consumable"]),
    })
  }

  if (materialGroups["medical_consumable"] !== undefined) {
    result.push({
      id: id++,
      label: c.var.t("material_type.label.medical_devices"),
      last_mile: Math.round(materialGroups["medical_consumable"]),
    })
  }

  return result
}

export const buildLastMileMonthlyLastMile = (
  c: Context,
  data: LastMileMonthlyLastMileDataDTO[],
  startPeriod: string,
  endPeriod: string
): LastMileMonthlyLastMileDTO => {
  // Create a map of existing data for quick lookup
  const dataMap = new Map<string, LastMileMonthlyLastMileDataDTO>()
  data.forEach((item) => {
    dataMap.set(item.period, item)
  })

  // Generate all months from start to end period
  const dataset: LastMileMonthlyLastMileItemDTO[] = []
  const current = moment(startPeriod, "YYYY-MM")
  const end = moment(endPeriod, "YYYY-MM")

  while (current.isSameOrBefore(end)) {
    const period = current.format("YYYY-MM")
    const existingData = dataMap.get(period)

    dataset.push({
      id: period,
      label: current.format("MMM YY"),
      vaccine: Math.round(existingData?.vaccine || 0),
      medicine: Math.round(existingData?.medicine || 0),
      consumable: Math.round(existingData?.consumable || 0),
      medical_consumable: Math.round(existingData?.medical_consumable || 0),
    })

    current.add(1, "month")
  }

  const firstPeriodFormatted = moment(startPeriod, "YYYY-MM").format("MMM YYYY")
  const lastPeriodFormatted = moment(endPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_12_months: `${firstPeriodFormatted} ${c.var.t("common.to")} ${lastPeriodFormatted}`,
    dataset,
  }
}

export const buildYearlyComparison = (
  c: Context,
  data: YearlyComparisonItemDTO[]
): YearlyComparisonDTO => {
  if (data.length === 0) {
    return {
      last_5_years: "",
      dataset: [],
    }
  }

  const dataset = data.map((item) => ({
    id: item.id.toString(),
    label: item.label,
    value: Math.round(item.value || 0),
  }))

  // Format the range as "YYYY to Dec YYYY"
  const years = dataset.map((item) => parseInt(item.id))
  const startYear = Math.min(...years)
  const endYear = Math.max(...years)

  return {
    last_5_years: `${startYear} ${c.var.t("common.to")} ${endYear}`,
    dataset,
  }
}
