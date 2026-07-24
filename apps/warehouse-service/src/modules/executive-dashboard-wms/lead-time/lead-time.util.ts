import moment from "moment"
import {
  LeadTimeMapDTO,
  LeadTimeMonthlyDTO,
  LeadTimeTop10DTO,
  MapArea,
  MapDatasetItem,
  Maps,
  MonthlyComparison,
  MonthlyDatasetItem,
  Most10Delivery,
  Most10DeliveryDatasetItem,
} from "./lead-time.schema.js"

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "Mei",
  "06": "Jun",
  "07": "Jul",
  "08": "Agu",
  "09": "Sep",
  "10": "Okt",
  "11": "Nov",
  "12": "Des",
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

function formatMonthLabel(yearMonth: string): string {
  const parts = yearMonth.split("-")
  const year = parts[0] ?? ""
  const month = parts[1] ?? ""
  const shortYear = year.slice(2)
  const label = month ? (MONTH_LABELS[month] ?? month) : ""
  return `${label} ${shortYear}`
}

export function buildMapsData(
  mapData: LeadTimeMapDTO[],
  tooltipTitle: Record<string, string>,
  provinceId?: string
): Maps {
  const provinceAreaName = mapData.find((row) => row.area_name)?.area_name ?? ""

  const dataset: MapDatasetItem[] = mapData
    .filter((row) => row.province_id && row.province_name)
    .map((row) => {
      const value = roundToOneDecimal(row.avg_lead_time_days)
      const tooltip = value ?`${tooltipTitle.exist}: ${value} days` : `${tooltipTitle.empty}`
      return {
        id: parseInt(row.province_id!),
        name: row.province_name!,
        value,
        tooltip,
      }
    })

  const area: MapArea = provinceId
    ? {
        id: parseInt(provinceId),
        name: provinceAreaName,
      }
    : {
        id: 0,
        name: "Nasional",
      }

  return { area, dataset }
}

export function buildMonthlyComparison(
  monthlyData: LeadTimeMonthlyDTO[]
): { monthlyComparison: MonthlyComparison } {
  const dataMap = new Map<string, number>()
  monthlyData.forEach((row) => {
    dataMap.set(row.month_key, row.avg_lead_time_days)
  })

  const dataset: MonthlyDatasetItem[] = []
  for (let i = 12; i >= 1; i--) {
    const monthKey = moment().subtract(i, "months").format("YYYY-MM")
    dataset.push({
      id: monthKey,
      label: formatMonthLabel(monthKey),
      value: roundToOneDecimal(dataMap.get(monthKey) ?? 0),
    })
  }

  const oldest = dataset[0]
  const newest = dataset[dataset.length - 1]
  const last12Months = oldest && newest
    ? `${oldest.label.replace(" ", " 20")} to ${newest.label.replace(" ", " 20")}`
    : ""

  return {
    monthlyComparison: {
      last_12_months: last12Months,
      dataset,
    },
  }
}

export function buildMost10Delivery(top10Data: LeadTimeTop10DTO[]): Most10Delivery {
  const lastMonth = moment().subtract(1, "month").format("MMM YYYY")

  const dataset: Most10DeliveryDatasetItem[] = top10Data
    .filter((row) => row.location_name)
    .map((row, index) => ({
      id: index + 1,
      label: row.location_name!,
      value: roundToOneDecimal(row.avg_lead_time_days),
    }))

  return {
    last_month: lastMonth,
    dataset,
  }
}
