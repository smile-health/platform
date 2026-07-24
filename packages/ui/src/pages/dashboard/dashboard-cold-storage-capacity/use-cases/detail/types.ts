export interface AggregateCapacityRemaining {
  last_updated?: string
  materials?: Material[]
  total?: Total
}

export interface Material {
  dosage_material?: number
  material_name?: string
  volume_material?: number
  volume_material_percentage?: number
}

export interface Total {
  dosage?: number
  volume?: number
}

export interface CapacityRemaining {
  data: CapacityRemainingData[]
  last_updated?: string
}

export interface CapacityRemainingData {
  max_temperature: number
  min_temperature: number
  remaining_percentage?: number | null
  remaining_volume: number
  total_volume_asset?: number
  usage_percentage: number | null
  volume_material?: number
}

export interface FunctionStatus {
  data?: Datum[]
  last_updated?: string
}

export interface Datum {
  type_id: number
  type_name: string
  temp_min: number
  temp_max: number
  total_well_functioning: number
  total_well_functioning_percentage: number
  total_standby: number
  total_standby_percentage: number
  total_commisioning_issue: number
  total_commisioning_issue_percentage: number
  total_not_functioning: number
  total_not_functioning_percentage: number
  total_functioning_need_repair: number
  total_functioning_need_repair_percentage: number
  total_count: number
}
