import { Context } from "hono"
import { HealthFacilityRepository } from "./health-facility.repository.js"
import {
  HealthFacilityQueryParams,
  HealthFacilityResponse,
  HealthFacilityDTO,
  ProvinceDataset,
  Marker,
  OverviewItem,
  YearlyComparisonItem,
} from "./health-facility.schema.js"

export class HealthFacilityModule {
  private static readonly CACHE_TTL = 10 * 60 // 10 minutes in seconds
  private static readonly CACHE_PREFIX = "exec_wms:health_facility"

  constructor(private readonly repository: HealthFacilityRepository) {}

  private generateCacheKey(params: HealthFacilityQueryParams): string {
    const sortedParams = Object.keys(params)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => `${key}=${params[key as keyof HealthFacilityQueryParams]}`)
      .join("&")
    return `${HealthFacilityModule.CACHE_PREFIX}:${sortedParams || "all"}`
  }

  async getHealthFacilityData(
    c: Context,
    queryParams: HealthFacilityQueryParams
  ): Promise<HealthFacilityResponse> {
    // Check cache first
    const cacheKey = this.generateCacheKey(queryParams)
      
    const [healthFacilities, overviewStats, lastUpdated, yearlyComparisonData] = await Promise.all([
      this.repository.fetchHealthFacilities(c, queryParams),
      this.repository.fetchOverviewStats(c, queryParams),
      this.repository.getLastUpdate(c),
      this.repository.fetchYearlyComparison(c, queryParams),
    ])

    // Group by province
    const provinceMap = new Map<number | string, HealthFacilityDTO[]>()
    
    for (const facility of healthFacilities) {
      const provinceId = facility.hf_province_id
      if (!provinceMap.has(provinceId)) {
        provinceMap.set(provinceId, [])
      }
      provinceMap.get(provinceId)!.push(facility)
    }

    // Build dataset
    const dataset: ProvinceDataset[] = []
    
    for (const [provinceId, facilities] of provinceMap.entries()) {
      const provinceName = facilities[0]?.hf_province_name || 'Unknown Province'
      
      // Calculate totals for the province
      let totalWaste = 0
      let totalBag = 0
      
      const markers: Marker[] = facilities
        .filter((facility) => {
          // Only include facilities with valid lat and lng (not null and not 0)
          const lat = facility.hf_latitude !== null ? Number(facility.hf_latitude) : null
          const lng = facility.hf_longitude !== null ? Number(facility.hf_longitude) : null
          return lat !== null && lat !== 0 && lng !== null && lng !== 0
        })
        .map((facility) => {
          // Sum up the totals for valid markers only
          totalWaste += Number(facility.total_waste_weight) || 0
          totalBag += Number(facility.waste_bag_count) || 0
          
          const marker: Marker = {
            id: facility.hf_id,
            is_health_center: Number(facility.hf_tag_id) === 9,
            region: {
              id: facility.hf_city_id || null,
              name: facility.hf_city_name || null,
            },
            transporter: facility.transporter_id ? {
              id: facility.transporter_id,
              name: facility.transporter_name || null,
            } : null,
            treatment: facility.treatment_id ? {
              id: facility.treatment_id,
              name: facility.treatment_name || null,
            } : null,
            internal_processing_facilities: facility.internal_processing_facilities_array && 
              Array.isArray(facility.internal_processing_facilities_array) 
              ? facility.internal_processing_facilities_array 
              : [],
            name: facility.hf_name || 'Unknown Facility',
            lat: facility.hf_latitude !== null ? Number(facility.hf_latitude) : null,
            lng: facility.hf_longitude !== null ? Number(facility.hf_longitude) : null,
            total: {
              waste: Number(facility.total_waste_weight) || 0,
              bag: Number(facility.waste_bag_count) || 0,
            },
          }
          
          // Add landfill if available
          if (facility.landfill_id && facility.landfill_name) {
            marker.landfill = {
              id: facility.landfill_id,
              name: facility.landfill_name,
            }
          }
          
          return marker
        })

      dataset.push({
        id: Number(provinceId),
        name: provinceName,
        markers,
        total: {
          waste: Number(totalWaste.toFixed(2)),
          bag: totalBag,
        },
      })
    }

    // Sort dataset by province id
    dataset.sort((a, b) => a.id - b.id)

    // Build overview
    const overview: OverviewItem[] = [
      {
        id: 1,
        label: "province",
        value: overviewStats.active_provinces,
        total: overviewStats.total_provinces,
      },
      {
        id: 2,
        label: "district",
        value: overviewStats.active_cities,
        total: overviewStats.total_cities,
      },
      {
        id: 3,
        label: "Health Facilities",
        value: overviewStats.active_health_facilities,
        total: overviewStats.total_health_facilities,
      },
    ]

    // Build yearly comparison
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 4
    const yearlyDataset: YearlyComparisonItem[] = yearlyComparisonData.map(item => ({
      id: String(item.year),
      label: String(item.year),
      value: Number(item.total_health_facilities),
    }))

    const yearlyComparison = {
      last_5_years: `${startYear} to Dec ${currentYear}`,
      dataset: yearlyDataset,
    }

    const response: HealthFacilityResponse = {
      last_updated: lastUpdated,
      data: {
        maps: {
          area: {
            id: queryParams.province_id ? Number(queryParams.province_id) : 0,
            name: queryParams.province_id && dataset.length > 0 && dataset[0] ? dataset[0].name : "Nasional",
          },
          dataset,
        },
        overview,
        yearly_comparison: yearlyComparison,
      },
    }

    return response
  }
}
