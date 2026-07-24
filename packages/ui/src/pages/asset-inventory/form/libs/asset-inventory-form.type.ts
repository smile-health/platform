import { OptionType } from '#components/react-select'
import { Color } from '#types/component'

import { AssetType } from '../../list/libs/asset-inventory-list.types'
import { WorkingStatusEnum } from './asset-inventory-constant'

export type WorkingStatusOption = {
  value: WorkingStatusEnum
  label: string
  color: Color
}

export interface AssetInventoryFormData {
  asset_type: (AssetType & OptionType) | null
  asset_type_name: string | null
  electricity: OptionType | null
  manufacture: OptionType | null
  asset_model: OptionType | null
  serial_number: string
  ownership_status: number | null
  production_year: OptionType | null
  entity: OptionType | null
  maintainer: OptionType | null
  budget_year: OptionType | null
  budget_source: OptionType | null
  asset_status: OptionType | null
  created_by: number | null
  updated_by: number | null
  borrowed_from: OptionType | null
  max_temperature: string | null
  min_temperature: string | null
  gross_capacity: string | null
  nett_capacity: string | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  warranty_vendor: OptionType | null
  calibration_last_date: string | null
  calibration_schedule: OptionType | null
  calibration_vendor: OptionType | null
  maintenance_last_date: string | null
  maintenance_schedule: OptionType | null
  maintenance_vendor: OptionType | null
  contact_person_user_1_id: number | null
  contact_person_user_2_id: OptionType | null
  contact_person_user_3_id: OptionType | null
  contact_person_user_1_name: string | null
  contact_person_user_2_name: string | null
  contact_person_user_3_name: string | null
  contact_person_user_1_number: string | null
  contact_person_user_2_number: string | null
  contact_person_user_3_number: string | null
  ownership_qty: number | null
  other_asset_model_name: string | null
  other_asset_type_name: string | null
  other_budget_source_name: string | null
  other_manufacture_name: string | null
  other_gross_capacity: number | null
  other_net_capacity: number | null
  other_max_temperature: number | null
  other_min_temperature: number | null
  other_borrowed_from_entity_name: string | null
  program_ids: OptionType[] | null
}

export interface AssetInventoryFormSubmitData {
  asset_electricity_id?: number | null
  asset_electricity_name?: string | null
  asset_model_id: number | null
  asset_model_name: string | null
  asset_type_id: number | null
  asset_type_name: string | null
  asset_working_status_id: number | null
  asset_working_status_name: string | null
  borrowed_from_entity_id: number | null
  borrowed_from_entity_name: string | null
  budget_source_id: number | null
  budget_source_name: string | null
  budget_year: number | null
  calibration_asset_vendor_id?: number | null
  calibration_asset_vendor_name?: string | null
  calibration_last_date?: string | null
  calibration_schedule_id?: number | null
  calibration_schedule_name?: string | null
  contact_persons: {
    name: string | null
    phone: string | null
  }[]
  entity_id: number | null
  entity_name: string | null
  maintenance_asset_vendor_id?: number | null
  maintenance_asset_vendor_name?: string | null
  maintenance_last_date?: string | null
  maintenance_schedule_id?: number | null
  maintenance_schedule_name?: string | null
  manufacture_id: number | null
  manufacture_name: string | null
  ownership_status: number | null
  production_year: number | null
  serial_number: string | null
  warranty_asset_vendor_id?: number | null
  warranty_asset_vendor_name?: string | null
  warranty_end_date?: string | null
  warranty_start_date?: string | null
  other_asset_model_name: string | null
  other_asset_type_name: string | null
  other_budget_source_name: string | null
  other_manufacture_name: string | null
  other_gross_capacity: number | null
  other_net_capacity: number | null
  other_max_temperature: number | null
  other_min_temperature: number | null
  program_ids: number[] | null
}

export interface AssetInventoryElectricityAvailable {
  id: number
  name: string
  created_at: string
  created_by: number | null
  created_by_user: string | null
  updated_at: string
  updated_by: number | null
  updated_by_user: string | null
}
