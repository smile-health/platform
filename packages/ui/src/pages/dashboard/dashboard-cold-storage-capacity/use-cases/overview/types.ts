export interface AverageMonthlyConsumption {
  last_update: string
  qty: number
}

export interface AverageOrderLeadTime {
  avg_duration: number
  last_update: string
  max_duration?: number
}

export interface CapacityStatus {
  last_update: string
  volume_material: number
  volume_material_percentage: number
  volume_max?: number
  volume_total: number
}

export interface DayOfSupply {
  last_update: string
  qty: number
}

export interface EntityByColdstorageStatusCapacity {
  count_buffer?: number
  count_ideal?: number
  count_max?: number
  count_total: number
  last_update: string
}
