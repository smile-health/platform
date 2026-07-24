export interface AnnualTargetAchievement {
  achievement: number
  last_update: string
  need: number
}

export interface FacilityPercentage {
  data: Datum[]
  last_update: string
}

export interface Datum {
  above_interval?: number
  above_interval_percentage?: number
  below_interval?: number
  below_interval_percentage?: number
  id?: number
  ideal_interval?: number
  ideal_interval_percentage?: number
  material_temperature_max?: string
  material_temperature_min?: string
}

export interface FacilityTotal {
  above_interval: number
  above_interval_percentage?: number
  below_interval: number
  below_interval_percentage?: number
  ideal_interval: number
  ideal_interval_percentage?: number
  last_update: string
}
