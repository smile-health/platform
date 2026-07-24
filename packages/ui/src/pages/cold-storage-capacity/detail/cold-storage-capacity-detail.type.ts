export type TEntity = {
  id: number
  name: string
}

export type TRelatedProgram = {
  program_id: number
  name: string
}

export type TAsset = {
  id: number
  asset_type: {
    id: string
    is_coldstorage: 1 | 0
    name: string
  }
  capacity_gross: number
  capacity_nett: number
  serial_number: string
  name: string
  status: number
  manufacture: {
    id: number
    name: string
  }
  asset_model: {
    id: number
    name: string
  }
}

export type TColdstorageMaterial = {
  id: number
  coldstorage_id: number
  entity_id: number
  material_id: number
  dosage_stock: number
  vial_stock: number
  package_stock: number
  package_volume: number
  projection_package_volume: number
  remain_package_fulfill: number
  volume_per_liter: number
  created_at: string
  updated_at: string
  max_dosage: number
  recommend_order_base_on_max: number
  projection_stock: number
  material: {
    id: number
    name: string
    code: string
    pieces_per_unit: number
    is_temperature_sensitive: number
    is_vaccine: number
    temperature_threshold_id: number
    material_global_id: number
    range_temperature: {
      min_temp: number
      max_temp: number
    }
    manufacture_material_volumes: [
      {
        material_volume_id: number
        material_id: number
        consumption_unit_per_distribution_unit: number
        box_length: number
        box_width: number
        box_height: number
        unit_per_box: number
        manufacture_name: string
      },
      {
        material_volume_id: number
        material_id: number
        consumption_unit_per_distribution_unit: number
        box_length: number
        box_width: number
        box_height: number
        unit_per_box: number
        manufacture_name: string
      },
    ]
  }
}

export type TColdStoragePerTemperature = {
  id: number
  range_temperature: {
    min_temp: number
    max_temp: number
  }
  total_volume: number
  volume_asset: number
  percentage_capacity: number
  projection_total_volume: number
  projection_volume_asset: number
  projection_percentage_capacity: number
  assets: TAsset[]
  coldstorage_materials: TColdstorageMaterial[]
}

export type TColdStorageCapacityDetailResponse = {
  id: number
  entity: TEntity
  total_volume: number
  volume_asset: number
  percentage_capacity: number
  projection_total_volume: number
  projection_volume_asset: number
  projection_percentage_capacity: number
  coldstorage_per_temperature: TColdStoragePerTemperature[]
  related_programs: TRelatedProgram[]
  created_at: string
  created_by: number
  updated_at: string
  updated_by: number
}

export type ColdStorageCapacityDetail = {
  id: string
  entity_name: string
  program: string
  real_capacity: {
    total_volume_stock: number
    asset_neto_capacity: number
    used_percentage: number
  }
  projected_capacity: {
    total_stock_volume: number
    asset_netto_capacity: number
    percentage_used: number
  }
}

export type ProgramOption = {
  label: string
  value: string
}

export type TemperatureStorageAsset = {
  name: string
  id: string
  items: TAsset[]
}

export type TemperatureStorageCapacity = {
  total_volume_stock: number
  asset_neto_capacity: number
  used_percentage: number
}

export type TemperatureStorage = {
  id: string
  temperature_range: {
    min_temp: number
    max_temp: number
  }
  assets: TemperatureStorageAsset[]
  capacity: TemperatureStorageCapacity
  coldstorage_materials: TColdstorageMaterial[]
}

export function transformDetailResponse(
  response: TColdStorageCapacityDetailResponse
): ColdStorageCapacityDetail {
  return {
    id: String(response.id),
    entity_name: response.entity?.name ?? '',
    program:
      response.related_programs?.length > 0
        ? response.related_programs.map((p) => p.name).join(', ')
        : 'All Programs',
    real_capacity: {
      total_volume_stock: response.total_volume ?? 0,
      asset_neto_capacity: response.volume_asset ?? 0,
      used_percentage: response.percentage_capacity ?? 0,
    },
    projected_capacity: {
      total_stock_volume: response.projection_total_volume ?? 0,
      asset_netto_capacity: response.projection_volume_asset ?? 0,
      percentage_used: response.projection_percentage_capacity ?? 0,
    },
  }
}

export function transformTemperatureStorages(
  temperatures?: TColdStoragePerTemperature[]
): TemperatureStorage[] {
  if (!temperatures || !Array.isArray(temperatures)) return []

  return temperatures
    .filter((temp) => temp.total_volume > 0)
    .map((temp) => ({
      id: String(temp.id),
      temperature_range: temp.range_temperature ?? { min_temp: 0, max_temp: 0 },
      assets: temp.assets.reduce((acc, asset): TemperatureStorageAsset[] => {
        acc.push({
          name: asset.asset_type.name,
          id: asset.asset_type.id,
          items: temp.assets.filter(
            (a) => a.asset_type.id === asset.asset_type.id
          ),
        })
        return acc
      }, []),
      capacity: {
        total_volume_stock: temp.total_volume ?? 0,
        asset_neto_capacity: temp.volume_asset ?? 0,
        used_percentage: temp.percentage_capacity ?? 0,
      },
      coldstorage_materials: temp.coldstorage_materials,
    }))
}

export function transformProgramOptions(
  programs: TRelatedProgram[]
): ProgramOption[] {
  const allOption: ProgramOption = { label: 'All Programs', value: '' }
  const programOptions: ProgramOption[] = programs.map((p) => ({
    label: p.name,
    value: String(p.program_id),
  }))

  return [allOption, ...programOptions]
}
