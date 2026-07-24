import { round } from "@smile-health/lib/utils.js"
import {
  StockTakingMapsDataDTO,
  StockTakingOverviewDataDTO,
  StockTakingMonthlyDataDTO,
  StockTakingRankingDataDTO,
  StockDiscardMapsDataDTO,
  StockDiscardMonthlyDataDTO,
  StockDiscardPendingDataDTO,
  StockDiscardTop10DataDTO,
  StockTakingMapItemDTO,
  StockTakingMonthlyComparisonItemDTO,
  StockTakingRankingItemDTO,
  StockDiscardMapItemDTO,
  StockDiscardMonthlyItemDTO,
  StockDiscardPendingItemDTO,
  StockDiscardTop10ItemDTO,
  AssetMapsDataDTO,
  AssetOverviewDataDTO,
  AssetOverdueDataDTO,
  AssetMapItemDTO,
  AssetOverviewItemDTO,
  AssetDistinctMapsDataDTO,
} from "./quality.schema.js"
import moment from "moment"

// Stock Taking Utility Functions
export const buildStockTakingMapsData = (
  data: StockTakingMapsDataDTO[],
  provinceId?: number | null,
  provinceName?: string
) => {
  const dataset: StockTakingMapItemDTO[] = data.map((item) => {
    const value =
      item.avg_accuracy_percentage < 0 ||
      Number.isNaN(item.avg_accuracy_percentage)
        ? 0
        : item.avg_accuracy_percentage

    return {
      id: item.id,
      name: item.name,
      value: round(value),
      tooltip: `Total Stock Taking Accuracy: ${value}%`,
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

export const buildStockTakingOverview = (
  overviewData: StockTakingOverviewDataDTO | null
) => {
  const stockTakingAccuracy =
    (overviewData && overviewData.avg_accuracy_percentage < 0) ||
    (overviewData && Number.isNaN(overviewData.avg_accuracy_percentage))
      ? 0
      : round(overviewData?.avg_accuracy_percentage || 0)

  return {
    stock_taking_accuracy: stockTakingAccuracy,
    stock_differene: overviewData ? round(overviewData.total_difference) : 0,
  }
}

export const buildStockTakingMonthlyComparison = (
  data: StockTakingMonthlyDataDTO[]
) => {
  if (data.length === 0) {
    return {
      last_12_months: "",
      dataset: [],
    }
  }

  const dataset: StockTakingMonthlyComparisonItemDTO[] = data.map((item) => {
    const date = moment(item.period, "YYYY-MM")
    const value =
      item.avg_accuracy_percentage < 0 ||
      Number.isNaN(item.avg_accuracy_percentage)
        ? 0
        : item.avg_accuracy_percentage

    return {
      id: item.period,
      label: date.format("MMM YY"),
      value: round(value),
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
    last_12_months: `${firstPeriod} to ${lastPeriod}`,
    dataset,
  }
}

export const buildStockTakingRanking = (
  data: StockTakingRankingDataDTO[],
  currentPeriod: string
) => {
  const dataset: StockTakingRankingItemDTO[] = data.map((item, index) => {
    const value =
      item.avg_accuracy_percentage < 0 ||
      Number.isNaN(item.avg_accuracy_percentage)
        ? 0
        : item.avg_accuracy_percentage

    return {
      row: index + 1,
      label: item.name,
      value: round(value),
    }
  })

  const lastMonth = moment(currentPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_month: lastMonth,
    dataset,
  }
}

// Stock Discard Utility Functions
export const buildStockDiscardMapsData = (
  discardData: StockDiscardMapsDataDTO[],
  pendingDiscardData: StockDiscardMapsDataDTO[],
  provinceId?: number | null,
  provinceName?: string
) => {
  // Create a map of pending discard data for quick lookup
  const pendingDiscardMap = new Map<number, number>()
  pendingDiscardData.forEach((item) => {
    pendingDiscardMap.set(item.id, item.pending_discard || 0)
  })

  const dataset: StockDiscardMapItemDTO[] = discardData.map((item) => {
    const pendingDiscard = pendingDiscardMap.get(item.id) || 0

    return {
      id: item.id,
      name: item.name,
      discard: round(item.discard),
      expired: round(item.expired),
      broken: round(item.broken),
      other: round(item.other),
      pending_discard: round(pendingDiscard),
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

export const buildStockDiscardTotal = (
  discardData: { discard: number },
  pendingDiscardData: { pending_discard: number }
) => {
  return {
    discard: round(discardData.discard),
    pending_discard: round(pendingDiscardData.pending_discard),
  }
}

export const buildStockDiscardMonthly = (
  data: StockDiscardMonthlyDataDTO[],
  startPeriod: string,
  endPeriod: string
) => {
  // Create a map of existing data for quick lookup
  const dataMap = new Map<string, StockDiscardMonthlyDataDTO>()
  data.forEach((item) => {
    dataMap.set(item.period, item)
  })

  // Generate all months from start to end period
  const dataset: StockDiscardMonthlyItemDTO[] = []
  const current = moment(startPeriod, "YYYY-MM")
  const end = moment(endPeriod, "YYYY-MM")

  while (current.isSameOrBefore(end)) {
    const period = current.format("YYYY-MM")
    const existingData = dataMap.get(period)

    dataset.push({
      id: period,
      label: current.format("MMM YY"),
      broken: round(existingData?.broken || 0),
      expired: round(existingData?.expired || 0),
      others: round(existingData?.other || 0),
    })

    current.add(1, "month")
  }

  const firstPeriodFormatted = moment(startPeriod, "YYYY-MM").format("MMM YYYY")
  const lastPeriodFormatted = moment(endPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    last_12_months: `${firstPeriodFormatted} to ${lastPeriodFormatted}`,
    dataset,
  }
}

export const buildStockDiscardHighestPending = (
  data: StockDiscardPendingDataDTO[],
  currentPeriod: string
) => {
  const dataset: StockDiscardPendingItemDTO[] = data.map((item, index) => ({
    row: index + 1,
    label: item.name,
    value: round(item.pending_discard),
  }))

  const thisMonth = moment(currentPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    this_month: thisMonth,
    dataset,
  }
}

export const buildStockDiscardTop10 = (
  data: StockDiscardTop10DataDTO[],
  currentPeriod: string
) => {
  const expired: StockDiscardTop10ItemDTO[] = []
  const broken: StockDiscardTop10ItemDTO[] = []
  const others: StockDiscardTop10ItemDTO[] = []

  data.forEach((item) => {
    const category = item.reason_category.toLowerCase()

    let targetArray: StockDiscardTop10ItemDTO[]
    if (category === "expired") {
      targetArray = expired
    } else if (category === "broken") {
      targetArray = broken
    } else {
      targetArray = others
    }

    if (targetArray.length < 10) {
      targetArray.push({
        row: targetArray.length + 1,
        label: item.parent_material_name,
        value: round(item.discard_qty * 100) / 100,
      })
    }
  })

  const thisMonth = moment(currentPeriod, "YYYY-MM").format("MMM YYYY")

  return {
    this_month: thisMonth,
    dataset: {
      expired,
      broken,
      others,
    },
  }
}

// Asset Utility Functions
export const buildAssetMapsData = (
  mapData: AssetMapsDataDTO[],
  mapDistinctData: AssetDistinctMapsDataDTO[],
  assetOverdueData: AssetOverdueDataDTO[],
  provinceId?: number | null,
  provinceName?: string
) => {
  const assetDistinctMap = new Map<number, AssetDistinctMapsDataDTO>()
  mapDistinctData.forEach((item) => {
    assetDistinctMap.set(item.id, { ...item })
  })
  const assetOverdueMap = new Map<number, AssetOverdueDataDTO>()
  assetOverdueData.forEach((item) => {
    assetOverdueMap.set(item.id, { ...item })
  })

  const dataset: AssetMapItemDTO[] = mapData.map((item) => {
    const totalAssets = item.total_asset_recorded
    const totalEntities = assetDistinctMap.get(item.id)?.total_entities || 0

    // Calculate damaged metrics - use separate data source
    const damagedValue = item.damaged_asset || 0
    const damagedValuePercent =
      totalAssets > 0 ? (damagedValue / totalAssets) * 100 : 0

    // Calculate unrecorded metrics
    const unrecordedValue =
      assetDistinctMap.get(item.id)?.entities_with_urecorded_asset || 0
    const unrecordedValuePercent =
      totalEntities > 0 ? (unrecordedValue / totalEntities) * 100 : 0

    // Get overdue calibration data from separate source
    const overdueData = assetOverdueMap.get(item.id) || {
      asset_overdue: 0,
      overdue_total_asset: 0,
    }
    const overdueTotal = overdueData.overdue_total_asset
    const overdueValue = overdueData.asset_overdue
    const overduePercent =
      overdueTotal > 0 ? (overdueValue / overdueTotal) * 100 : 0

    // Calculate temperature excursion metrics
    const tempExcursionValue =
      assetDistinctMap.get(item.id)?.total_asset_cce_excursion || 0
    const tempExcursionPercent =
      item.total_asset_cce_rtmd > 0
        ? (tempExcursionValue / item.total_asset_cce_rtmd) * 100
        : 0

    // Format average temperature excursion duration
    const avgDuration =
      assetDistinctMap.get(item.id)?.avg_duration_excursion || 0
    const hours = Math.floor(avgDuration)
    const minutes = round((avgDuration - hours) * 60)
    const avgTempExcursion = `${hours} hours ${minutes} minutes`

    return {
      id: item.id,
      name: item.name,
      damaged: {
        value: damagedValue,
        percent: round(damagedValuePercent),
        total: totalAssets,
      },
      unrecorded: {
        value: unrecordedValue,
        percent: round(unrecordedValuePercent),
        total: totalEntities,
      },
      overdue_calibartion: {
        value: overdueValue,
        percent: round(overduePercent),
        total: overdueTotal,
      },
      temp_excursion: {
        value: tempExcursionValue,
        percent: round(tempExcursionPercent),
        total: item.total_asset_cce_rtmd,
      },
      avg_temp_excursion: avgTempExcursion,
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

export const buildAssetOverview = (
  data: AssetOverviewDataDTO[]
): AssetOverviewItemDTO[] => {
  return data.map((item) => ({
    id: item.asset_type_id?.toString() || "0",
    label: item.asset_type_name || "Unknown",
    value: round(item.total_asset_recorded),
  }))
}

export const buildAssetTotal = (data: {
  total_asset_recorded: number
}): number => {
  return round(data.total_asset_recorded)
}
