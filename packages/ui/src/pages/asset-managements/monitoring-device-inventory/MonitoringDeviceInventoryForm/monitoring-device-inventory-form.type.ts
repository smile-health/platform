import { OptionType, OptionTypeWithData } from '#components/react-select'
import { TListAssetModel } from '#services/asset-model'

export interface FormValues {
  asset_communication_provider: OptionType | null
  asset_model_id?: OptionTypeWithData<TListAssetModel> | null
  asset_rtmd_status_id: OptionType | null
  asset_type_id: OptionType | null
  asset_vendor_id: OptionType | null
  budget_source_id: OptionType | null
  budget_year: OptionType | null
  contact_person_user_1_name: string
  contact_person_user_1_number: string
  contact_person_user_2_name: string
  contact_person_user_2_number: string
  contact_person_user_3_name: string
  contact_person_user_3_number: string
  entity_id: OptionType | null
  manufacture_id: OptionType | null
  production_year: OptionType | null
  serial_number: string
}

export interface Request {
  asset_communication_provider_id: number
  asset_model_id: number
  asset_rtmd_status_id: number
  asset_type_id: number
  asset_vendor_id: number
  budget_source_id: number
  budget_year: number
  contact_persons?: ContactPerson[]
  entity_id: number
  manufacture_id: number
  production_year: number
  serial_number: string
  status?: number
}

export interface ContactPerson {
  name: string
  phone: string
}
