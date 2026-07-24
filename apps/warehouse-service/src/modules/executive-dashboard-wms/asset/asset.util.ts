import {
  AssetDataDTO,
  NationalDataDTO,
  MapDatasetItem,
  MapArea,
  Maps,
  Overview,
} from "./asset.schema.js"

export function buildMapsData(assetData: AssetDataDTO[], provinceId?: string): Maps {
  const dataset: MapDatasetItem[] = assetData
    .map((asset) => {
      const parsedId = Number.parseInt(asset.province_id, 10)

      if (Number.isNaN(parsedId)) {
        return null
      }

      return {
        id: parsedId,
        name: asset.province_name,
        coldstorage: Number(asset.coldstorage),
        autoclave: Number(asset.autoclave),
        incinerator: Number(asset.incinerator),
        scale: {
          unit: Number(asset.scale_unit),
          borrowed: Number(asset.scale_borrowed),
        },
        overdue_calbration: Number(asset.overdue_calibration),
      }
    })
    .filter((item): item is MapDatasetItem => item !== null)

  const parsedProvinceId = provinceId ? Number.parseInt(provinceId, 10) : 0
  const selectedAreaName = assetData[0]?.area_name ?? assetData[0]?.province_name ?? ""

  const area: MapArea = provinceId
    ? { id: Number.isNaN(parsedProvinceId) ? 0 : parsedProvinceId, name: selectedAreaName }
    : { id: 0, name: "Nasional" }

  return { area, dataset }
}

export function buildOverviewData(national: NationalDataDTO): Overview {
  const ownershipTotal = Number(national.ownership_total_scale)
  const ownershipLoaned = Number(national.ownership_scale_borrowed)
  const ownershipSelfOwned = ownershipTotal - ownershipLoaned
  
  return {
    ownership: {
      total: ownershipTotal,
      loaned: ownershipLoaned,
      self_owned: ownershipSelfOwned,
    },
    scale: {
      shared: {
        total: Number(national.scale_shared_total),
        from_third_party: Number(national.scale_shared_from_third_party),
      },
      provided: {
        third_party: Number(national.scale_provided_third_party),
        health_facilitator: Number(national.scale_provided_health_facilitator),
      },
    },
    cold_storage: {
      total: Number(national.overview_cold_storage_total),
      borrowed: Number(national.overview_cold_storage_borrowed),
    },
    autoclave: Number(national.overview_autoclave),
    incinerator: Number(national.overview_incinerator),
  }
}
