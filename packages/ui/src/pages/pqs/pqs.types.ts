import { OptionType } from '#components/react-select'
import { CommonType } from '#types/common'
import { TUserUpdatedBy } from '#types/volume-materials'

export type PQSFormProps = CommonType & {
  defaultValues?: CreatePQSFormInput
}

export type CreatePQSFormCapacityInput = {
  net_capacity5?: number | null
  net_capacityMin20?: number | null
  net_capacityMin86?: number | null
}

export type CreatePQSFormInput = CreatePQSFormCapacityInput & {
  code?: string
  pqs_type_id?: OptionType | null
  cceigat_description_id?: OptionType | null
  is_related_asset?: number | null
}

export type CreatePQSPayload = CreatePQSFormCapacityInput & {
  code?: string
  pqs_type_id?: number
  cceigat_description_id?: number
}

export type PQSDetailInfoProps = {
  isLoading: boolean
  data?: PQSDetail
}

export type CapacityType = 'capacities5' | 'capacitiesMin20' | 'capacitiesMin86'

export type CapacityDetail = { id_temperature_threshold: number } & {
  [key in CapacityType]: number
}

export type DropdownValue = {
  id: number
  name: string
}

export type PQSDetail = {
  id: number
  pqs_code: string
  pqs_type: DropdownValue
  cceigat_description: DropdownValue
  cceigat_description_id: number
  capacities: CapacityDetail[]
  updated_at: string
  updated_by: number
  created_by: number
  user_updated_by: TUserUpdatedBy
  user_created_by: TUserUpdatedBy
  id_temperature_threshold?: number
  is_related_asset?: number
}

export type PQSType = {
  id: number
  name: string
}
