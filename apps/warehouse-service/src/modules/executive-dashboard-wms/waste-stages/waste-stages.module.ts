import { Context } from "hono"
import { WasteStagesRepository } from "./waste-stages.repository.js"
import {
  WasteStagesQueryParams,
  WasteStagesResponse,
  MapsResponse,
  OverviewResponse,
  ProvinceAggregateDTO,
  OverviewBagDTO,
  OverviewKgDTO,
  ProvinceMapData,
} from "./waste-stages.schema.js"

export class WasteStagesModule {
  constructor(private readonly repository: WasteStagesRepository) {}

  private toNumber(value: unknown): number {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  private convertUnit(value: number, unit: string): number {
    if (unit === "ton") {
      return value / 1000
    }
    return value
  }

  async getWasteStagesData(
    c: Context,
    queryParams: WasteStagesQueryParams
  ): Promise<WasteStagesResponse> {
    const { province_id, unit } = queryParams

    // Fetch all required data in parallel
    const [
      provinceData,
      overviewBag,
      overviewKg,
      lastUpdated,
    ] = await Promise.all([
      this.repository.fetchProvinceAggregate(c, province_id),
      this.repository.fetchOverviewBag(c, province_id),
      this.repository.fetchOverviewKg(c, province_id),
      this.repository.getLastUpdate(c),
    ])

    // Build maps data
    const maps = this.buildMapsData(c, provinceData, province_id, unit)

    // Build overview data
    const overview = this.buildOverviewData(overviewBag, overviewKg, provinceData, unit)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        overview,
      },
    }
  }

  private buildMapsData(
    c: Context,
    provinceData: ProvinceAggregateDTO[],
    provinceId?: string,
    unit: string = "kg"
  ): MapsResponse {
    const dataset: ProvinceMapData[] = provinceData.map((province) => ({
      id: province.id,
      name: province.name,
      health_facilities: [
        {
          key: c.var.t("waste_stages.health_facility.Hospitals"),
          value: this.toNumber(province.total_hospitals),
        },
        {
          key: c.var.t("waste_stages.health_facility.Puskesmas"),
          value: this.toNumber(province.total_puskesmas),
        },
      ],
      temp_storage: parseFloat(this.convertUnit(this.toNumber(province.temp_storage), unit).toFixed(2)),
      cold_storage: parseFloat(this.convertUnit(this.toNumber(province.cold_storage), unit).toFixed(2)),
      pickup: parseFloat(this.convertUnit(this.toNumber(province.pickup), unit).toFixed(2)),
      process: parseFloat(this.convertUnit(this.toNumber(province.process), unit).toFixed(2)),
      landfill: parseFloat(this.convertUnit(this.toNumber(province.landfill), unit).toFixed(2)),
      recycle: parseFloat(this.convertUnit(this.toNumber(province.recycle), unit).toFixed(2)),
      total: parseFloat(this.convertUnit(this.toNumber(province.total), unit).toFixed(2)),
    }))

    // Determine area based on province_id filter
    let area = {
      id: 0,
      name: "Nasional",
    }

    if (provinceId && provinceData.length > 0) {
      // When province_id is provided, use province info instead of city info
      area = {
        id: provinceData[0]?.province_id ?? 0,
        name: provinceData[0]?.province_name ?? "Unknown",
      }
    }

    return {
      area,
      dataset,
    }
  }

  private buildOverviewData(
    bagData: OverviewBagDTO,
    kgData: OverviewKgDTO,
    provinceData: ProvinceAggregateDTO[],
    unit: string = "kg"
  ): OverviewResponse {
    const totals = provinceData.reduce(
      (acc, item) => ({
        temp_storage: acc.temp_storage + this.toNumber(item.temp_storage),
        cold_storage: acc.cold_storage + this.toNumber(item.cold_storage),
        pickup: acc.pickup + this.toNumber(item.pickup),
        process: acc.process + this.toNumber(item.process),
        landfill: acc.landfill + this.toNumber(item.landfill),
        recycle: acc.recycle + this.toNumber(item.recycle),
      }),
      {
        temp_storage: 0,
        cold_storage: 0,
        pickup: 0,
        process: 0,
        landfill: 0,
        recycle: 0,
      }
    )

    return {
      total: {
        by_bag: {
          value: this.toNumber(bagData.today_bag_count),
          from_yesterday: this.toNumber(bagData.yesterday_bag_count),
        },
        by_unit: {
          value: parseFloat(this.convertUnit(this.toNumber(kgData.today_kg), unit).toFixed(2)),
          from_yesterday: parseFloat(this.convertUnit(this.toNumber(kgData.yesterday_kg), unit).toFixed(2)),
        },
      },
      temp_storage: parseFloat(this.convertUnit(totals.temp_storage, unit).toFixed(2)),
      cold_storage: parseFloat(this.convertUnit(totals.cold_storage, unit).toFixed(2)),
      pickup: parseFloat(this.convertUnit(totals.pickup, unit).toFixed(2)),
      process: parseFloat(this.convertUnit(totals.process, unit).toFixed(2)),
      landfill: parseFloat(this.convertUnit(totals.landfill, unit).toFixed(2)),
      recycle: parseFloat(this.convertUnit(totals.recycle, unit).toFixed(2)),
    }
  }
}
