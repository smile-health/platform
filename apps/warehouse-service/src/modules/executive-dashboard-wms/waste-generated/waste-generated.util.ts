import moment from "moment"
import { Context } from "hono"
import {
  WasteInventoryDTO,
  HealthFacilityCountDTO,
  MonthlyDataDTO,
  RankingDataDTO,
  LastAvailableMonthDTO,
  Maps,
  Overview,
  MonthlyComparison,
  RankingSection,
  MapDatasetItem,
} from "./waste-generated.schema.js"

// Helper function untuk konversi unit
export function convertUnit(value: number, unit: string): number {
  if (unit === "ton") {
    return value / 1000
  }
  return value
}

// Build maps data
export function buildMapsData(
  c: Context,
  inventoryData: WasteInventoryDTO[],
  healthFacilityCount: HealthFacilityCountDTO[],
  provinceId?: string,
  unit: string = "kg"
): Maps {
  if (provinceId) {
    // When province_id is provided, group by city
    const cityMap = new Map<string, WasteInventoryDTO[]>()
    
    inventoryData.forEach((item) => {
      if (item.hf_city_id) {
        if (!cityMap.has(item.hf_city_id)) {
          cityMap.set(item.hf_city_id, [])
        }
        cityMap.get(item.hf_city_id)!.push(item)
      }
    })

    // Build dataset per city
    const dataset: MapDatasetItem[] = []
    
    cityMap.forEach((items, cityId) => {
      const firstItem = items[0]
      
      // Get health facility count for this city using city name
      const facilityCount = healthFacilityCount.find(
        (f) => f.hf_city_name === firstItem.hf_city_name
      )
      
      const healthFacilities = []
      if (facilityCount) {
        if (facilityCount.total_puskesmas > 0) {
          healthFacilities.push({
            key: c.var.t("waste_generated.health_facility.Puskesmas"),
            value: facilityCount.total_puskesmas,
          })
        }
        if (facilityCount.total_rumah_sakit > 0) {
          healthFacilities.push({
            key: c.var.t("waste_generated.health_facility.Hospitals"),
            value: facilityCount.total_rumah_sakit,
          })
        }
      }

      // Aggregate waste by category using pivot columns
      let infectious = 0
      let non_infectious = 0
      let toxic_waste = 0
      let inorganic = 0
      let organic = 0

      items.forEach((item) => {
        infectious += item.clinical_infectious_weight_kg || 0
        non_infectious += item.clinical_non_infectious_weight_kg || 0
        toxic_waste += item.hazard_toxic_weight_kg || 0
        inorganic += item.domestic_anorganik_weight_kg || 0
        organic += item.domestic_organik_weight_kg || 0
      })

      const total = items.reduce((s, item) => s + item.total_weight, 0)

      dataset.push({
        id: parseInt(cityId) || 0,
        name: firstItem.hf_city_name || "Unknown",
        health_facilities: healthFacilities,
        infectious: parseFloat(convertUnit(infectious, unit).toFixed(2)),
        non_infectious: parseFloat(convertUnit(non_infectious, unit).toFixed(2)),
        toxic_waste: parseFloat(convertUnit(toxic_waste, unit).toFixed(2)),
        inorganic: parseFloat(convertUnit(inorganic, unit).toFixed(2)),
        organic: parseFloat(convertUnit(organic, unit).toFixed(2)),
        total: parseFloat(convertUnit(total, unit).toFixed(2)),
      })
    })

    return {
      area: {
        id: parseInt(provinceId),
        name: inventoryData[0]?.hf_province_name || "Unknown",
      },
      dataset: dataset.sort((a, b) => a.id - b.id),
    }
  } else {
    // When no province_id, group by province
    const provinceMap = new Map<string, WasteInventoryDTO[]>()
    
    inventoryData.forEach((item) => {
      if (item.hf_province_id) {
        if (!provinceMap.has(item.hf_province_id)) {
          provinceMap.set(item.hf_province_id, [])
        }
        provinceMap.get(item.hf_province_id)!.push(item)
      }
    })

    // Build dataset per province
    const dataset: MapDatasetItem[] = []
    
    provinceMap.forEach((items, provId) => {
      const firstItem = items[0]
      
      // Get health facility count for this province using province name
      // The query now returns already aggregated data per province
      const facilityCount = healthFacilityCount.find(
        (f) => f.hf_province_name === firstItem.hf_province_name
      )
      
      const healthFacilities = []
      if (facilityCount) {
        if (facilityCount.total_puskesmas > 0) {
          healthFacilities.push({
            key: c.var.t("waste_generated.health_facility.Puskesmas"),
            value: facilityCount.total_puskesmas,
          })
        }
        if (facilityCount.total_rumah_sakit > 0) {
          healthFacilities.push({
            key: c.var.t("waste_generated.health_facility.Hospitals"),
            value: facilityCount.total_rumah_sakit,
          })
        }
      }

      // Aggregate waste by category using pivot columns
      let infectious = 0
      let non_infectious = 0
      let toxic_waste = 0
      let inorganic = 0
      let organic = 0

      items.forEach((item) => {
        infectious += item.clinical_infectious_weight_kg || 0
        non_infectious += item.clinical_non_infectious_weight_kg || 0
        toxic_waste += item.hazard_toxic_weight_kg || 0
        inorganic += item.domestic_anorganik_weight_kg || 0
        organic += item.domestic_organik_weight_kg || 0
      })

      const total = items.reduce((s, item) => s + item.total_weight, 0)

      dataset.push({
        id: parseInt(provId) || 0,
        name: firstItem.hf_province_name || "Unknown",
        health_facilities: healthFacilities,
        infectious: parseFloat(convertUnit(infectious, unit).toFixed(2)),
        non_infectious: parseFloat(convertUnit(non_infectious, unit).toFixed(2)),
        toxic_waste: parseFloat(convertUnit(toxic_waste, unit).toFixed(2)),
        inorganic: parseFloat(convertUnit(inorganic, unit).toFixed(2)),
        organic: parseFloat(convertUnit(organic, unit).toFixed(2)),
        total: parseFloat(convertUnit(total, unit).toFixed(2)),
      })
    })

    return {
      area: {
        id: 0,
        name: "Nasional",
      },
      dataset: dataset.sort((a, b) => a.id - b.id),
    }
  }
}

// Build overview data
export function buildOverviewData(
  inventoryData: WasteInventoryDTO[],
  todayData: { waste_bag_count: number; total_waste_weight: number | null },
  yesterdayData: { waste_bag_count: number; total_waste_weight: number | null },
  unit: string = "kg"
): Overview {
  // Aggregate total by category using pivot columns
  let infectious = 0
  let non_infectious = 0
  let toxic_waste = 0
  let inorganic = 0
  let organic = 0
  let totalBags = 0
  let totalWeight = 0

  inventoryData.forEach((item) => {
    totalBags += item.total_bags
    totalWeight += item.total_weight
    infectious += item.clinical_infectious_weight_kg || 0
    non_infectious += item.clinical_non_infectious_weight_kg || 0
    toxic_waste += item.hazard_toxic_weight_kg || 0
    inorganic += item.domestic_anorganik_weight_kg || 0
    organic += item.domestic_organik_weight_kg || 0
  })

  // Get yesterday's actual values (not the difference)
  const yesterdayBags = yesterdayData.waste_bag_count
  const yesterdayWeight = yesterdayData.total_waste_weight || 0

  return {
    total: {
      by_bag: {
        value: totalBags,
        from_yesterday: yesterdayBags,
      },
      by_unit: {
        value: parseFloat(convertUnit(totalWeight, unit).toFixed(3)),
        from_yesterday: parseFloat(convertUnit(yesterdayWeight, unit).toFixed(3)),
      },
    },
    infectious: parseFloat(convertUnit(infectious, unit).toFixed(2)),
    non_infectious: parseFloat(convertUnit(non_infectious, unit).toFixed(2)),
    toxic_waste: parseFloat(convertUnit(toxic_waste, unit).toFixed(2)),
    inorganic: parseFloat(convertUnit(inorganic, unit).toFixed(2)),
    organic: parseFloat(convertUnit(organic, unit).toFixed(2)),
  }
}

// Build monthly comparison data
export function buildMonthlyComparisonData(
  monthlyData: MonthlyDataDTO[],
  unit: string = "kg"
): MonthlyComparison {
  // Group by month
  const monthMap = new Map<
    number,
    Record<string, number | string>
  >()

  monthlyData.forEach((item) => {
    const monthId = item.month_id
    
    if (!monthMap.has(monthId)) {
      monthMap.set(monthId, {
        infectious: 0,
        non_infectious: 0,
        toxic_waste: 0,
        inorganic: 0,
        organic: 0,
        label: item.month_label,
      })
    }

    const monthData = monthMap.get(monthId)!
    
    // Map waste_type_name to category
    const typeName = item.waste_type_name.toLowerCase()
    if (typeName.includes('non infeksius') || typeName.includes('clinical non infectious')) {
      monthData.non_infectious = (monthData.non_infectious as number) + convertUnit(item.total_waste_weight || 0, unit)
    } else if (typeName.includes('infeksius') || typeName.includes('clinical infectious')) {
      monthData.infectious = (monthData.infectious as number) + convertUnit(item.total_waste_weight || 0, unit)
    } else if (typeName.includes('anorganik') || typeName.includes('inorganic')) {
      monthData.inorganic = (monthData.inorganic as number) + convertUnit(item.total_waste_weight || 0, unit)
    } else if (typeName.includes('organik') || typeName.includes('organic')) {
      monthData.organic = (monthData.organic as number) + convertUnit(item.total_waste_weight || 0, unit)
    } else if (typeName.includes('b3') || typeName.includes('toxic') || typeName.includes('hazard')) {
      monthData.toxic_waste = (monthData.toxic_waste as number) + convertUnit(item.total_waste_weight || 0, unit)
    }
  })

  // Build dataset
  const dataset = Array.from(monthMap.entries())
    .map(([monthId, data]) => {
      const { label, ...values } = data
      const total = 
        (values.infectious as number) +
        (values.non_infectious as number) +
        (values.toxic_waste as number) +
        (values.inorganic as number) +
        (values.organic as number)
      
      return {
        id: monthId.toString(),
        label: label as string,
        value: {
          infectious: parseFloat((values.infectious as number).toFixed(2)),
          non_infectious: parseFloat((values.non_infectious as number).toFixed(2)),
          toxic_waste: parseFloat((values.toxic_waste as number).toFixed(2)),
          inorganic: parseFloat((values.inorganic as number).toFixed(2)),
          organic: parseFloat((values.organic as number).toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        },
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id))

  // Get date range
  const firstMonth = dataset[0]?.label || ""
  const lastMonth = dataset[dataset.length - 1]?.label || ""

  return {
    last_12_months: `${firstMonth} to ${lastMonth}`,
    dataset,
  }
}

// Build ranking data (most_waste or lowest_waste)
export function buildRankingData(
  rankingData: RankingDataDTO[],
  lastMonthInfo: LastAvailableMonthDTO | null,
  unit: string = "kg"
): RankingSection {
  const dataset = rankingData.map((item, index) => ({
    row: index + 1,
    id: item.area_id || "",
    label: item.area_name || "Unknown",
    value: parseFloat(convertUnit(item.total_waste || 0, unit).toFixed(2)),
  }))

  return {
    last_month: lastMonthInfo?.last_month_label || "N/A",
    dataset,
  }
}
