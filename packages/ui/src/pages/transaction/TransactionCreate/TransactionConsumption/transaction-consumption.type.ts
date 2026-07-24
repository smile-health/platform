import { OptionType } from '#components/react-select'
import { DetailStock, Stock, StockDetailStock } from '#types/stock'
import { UseFormReturn, UseFormSetValue } from 'react-hook-form'

import { CreateTransactionDetail } from '../transaction-create.type'
import { TCommonObject } from '#types/common'

export type CreateTransactionConsumption = CreateTransactionDetail & {
  type: 'consumption'
  items: CreateTransactionConsumptionItems[]
}

export type CreateTransactionConsumptionItems = {
  material_id: number | undefined | null
  material_name: string | undefined | null
  available_stock: number | undefined | null
  on_hand_stock: number | undefined | null
  min: number | undefined | null
  max: number | undefined | null
  managed_in_batch: number | undefined | null
  temperature_sensitive: number | undefined | null
  pieces_per_unit: number | undefined | null
  stock_id: number | undefined | null
  unit: string | undefined | null
  batches: CreateTransactionBatch[] | null | undefined
  batchNonActivity: DetailStock[] | null | undefined
  is_vaccine: number | null | undefined
  is_need_sequence: number | null | undefined
  is_open_vial: boolean | undefined
  protocol_id?: number | null
  is_kipi?: number | null
}

export type CreateTransactionBatch = {
  batch_id: number | undefined | null
  activity_id: number | undefined | null
  activity_name: string | undefined | null
  change_qty: number | undefined | null
  open_vial: number | undefined | null
  close_vial: number | undefined | null
  code: string | undefined | null
  production_date: string | undefined | null
  expired_date: string | undefined | null
  manufacturer: OptionType | undefined | null
  on_hand_stock: number | undefined | null
  min: number | undefined | null
  max: number | undefined | null
  available_qty: number | undefined | null
  open_vial_qty: number | undefined | null
  allocated_qty: number | undefined | null
  temperature_sensitive: number | undefined | null
  pieces_per_unit: number | undefined | null
  status_material: OptionType | undefined | null
  managed_in_batch: number | undefined | null
  vaccine_type: OptionType | undefined | null
  vaccine_method: OptionType | undefined | null
  vaccine_max_qty: number | undefined | null
  vaccine_min_qty: number | undefined | null
  patients: CreateTransactionConsumptionPatient[] | null | undefined
  is_vaccine: number | null | undefined
  is_need_sequence: number | null | undefined
  all_patient_id?: DataPatientId
  is_open_vial: boolean | undefined
  protocol_id?: number | null
  is_kipi?: number | null
  is_medical_history?: number | null
}

export type CreateTransactionChild = {
  batches: CreateTransactionBatch[] | null | undefined
  all_patient_id?: DataPatientId
}

export type setBatches = {
  obj?: DetailStock
  materialItemList?: StockDetailStock[]
  selectedItem?: Stock
}

export type BodyMaterialPatientOtherSequence = {
  vaccine_sequence?: number | null
  actual_transaction_date?: string | null
}

export type BodyMaterialPatient = {
  identity_type?: number | null
  identity_number?: string | null
  patient_id?: string | null
  name?: string | null
  phone_number?: string | null
  gender?: number | null
  birth_date?: string | null
  education_id?: number | null
  occupation_id?: number | null
  marital_status?: number | null
  religion_id?: number | null
  ethnic_id?: number | null
  residential_address?: string | null
  residential_province_id?: number | null
  residential_regency_id?: number | null
  residential_subdistrict_id?: number | null
  residential_village_id?: number | null
  address?: string | null
  province_id?: number | null
  regency_id?: number | null
  subdistrict_id?: number | null
  village_id?: number | null
  rt?: string | null
  rw?: string | null
  vaccine_sequence?: number | null
  reaction_id?: number | null
  other_reaction?: string | null
  is_diagnose_before?: number | null
  diagnosis_date?: string | null
  month_before?: number | null
  year_before?: number | null
  received_medicine?: number | null
  received_vaccine?: number | null
  notes?: string | null
  other_sequences?: BodyMaterialPatientOtherSequence[]
}

export type BodyMaterial =
  | {
    material_id: number | undefined | null
    qty?: number | null
    stock_id: number | undefined | null
    vaccine_method?: number | null
    vaccine_type?: number | null
    identity_number?: number | null
    patient_id?: string | null
    phone_number?: string | null
    patients?: BodyMaterialPatient[]
    open_vial?: number | null
    close_vial?: number | null
  }
  | undefined

export type CreateTransactionConsumptionBody = {
  activity_id: number
  actual_transaction_date: string | null
  entity_activity_id: number | null | undefined
  customer_id: number
  entity_id: number
  materials: BodyMaterial[]
}

export type CreateTransactionConsumptionPatient = {
  is_vaccine: number | undefined | null
  protocol_id: number | undefined | null
  is_medical_history: number | undefined | null
  vaccination: {
    options_sequence?: ListRabiesSequenceResponse
    is_kipi: number | undefined | null
    is_need_sequence: number | undefined | null
    is_vaccine: number | undefined | null
    vaccine_sequence: OptionType & { min?: number, max?: number } | undefined | null
    patient_id: string | undefined | null
    is_valid_patient: number | undefined | null

    // rabies
    identity_type: OptionType | undefined | null
    vaccine_type: OptionType | undefined | null
    vaccine_method: OptionType | undefined | null

    // dengue
    reaction_id: OptionType | undefined | null
    other_reaction: string | undefined | null
  }
  identity: {
    full_name: string | null | undefined
    gender: OptionType | null | undefined
    marital_status: OptionType | null | undefined
    last_education: OptionType | null | undefined
    occupation: OptionType | null | undefined
    religion: OptionType | null | undefined
    ethnic: OptionType | null | undefined
    phone_number: string | null | undefined
    birth_date: string | null | undefined
    province: OptionType | null | undefined
    regency: OptionType | null | undefined
    sub_district: OptionType | null | undefined
    village: OptionType | null | undefined
    is_matched_address: number | null | undefined
    registered_address: string | null | undefined
    province_residential: OptionType | null | undefined
    regency_residential: OptionType | null | undefined
    sub_district_residential: OptionType | null | undefined
    village_residential: OptionType | null | undefined
    residential_address: string | null | undefined
  }
  history_medical?: HistoryMedical
  history_vaccination?: HistoryVaccination
  generate_from_nik?: {
    gender: OptionType | null | undefined
    birth_date: string | null | undefined
  }
  patient?: PatientIdentityNIK | null
}

export type PatientIdentityProps = {
  item: CreateTransactionBatch
  setValueBatch: UseFormSetValue<CreateTransactionChild>
  indexItem: number
  isErrorBatch?: boolean
  indexParent: number
  currentAllPatientId?: DataPatientId
}

export type MethodSequence =
  | {
    id: number
    title: string
    is_multi_patient: number
    sequences: {
      id: number
      title: string
      min: number
      max: number
    }[]
  }
  | undefined

export type ListRabiesSequenceResponse = {
  id: number
  title: string
  methods: MethodSequence[]
}[]

export type FormDataPatient = {
  data: CreateTransactionConsumptionPatient[]
  all_patient_id?: PatientIdGroup
}

export type PatientIdentityFrom = PatientIdentityProps & {
  methods: UseFormReturn<FormDataPatient>
}

type VaccineOption = {
  vaccine_sequence: number
  vaccine_sequence_title: string
  date: string | null
}

type ValidationMessage = {
  message: string
  data: VaccineOption[]
}

export type ValidationErrorsRabies =
  | Record<string, ValidationMessage[]>
  | { [key: string]: string[] }

export type MaterialCompletedSequencePatient = {
  actual_date: string | null
  patient_id?: string | null
  identity_type?: number | null
  selected_vaccine_sequence_title?: string | null
  selected_vaccine_method_title?: string | null
  protocol_id?: number | null
  data: {
    vaccine_sequence: number
    vaccine_sequence_title: string
    date: string | null
    entity: OptionType | null
    reaction: OptionType | null
    other_reaction: string | null
  }[]
}

export type MaterialCompletedSequenceForm = {
  patients?: MaterialCompletedSequencePatient[]
}

export type CompletedSequenceForm = {
  materials: MaterialCompletedSequenceForm[]
}

type PatientIdGroup = {
  nik: (string | null | undefined)[]
  non_nik: (string | null | undefined)[]
}

type ResultBatch = {
  batches: PatientIdGroup[]
}

export type DataPatientId = ResultBatch[]

export type HistoryVaccination = {
  last_vaccine_date: string | null | undefined
  name: string | null | undefined
  next_sequence: {
    id: number
    name: string
  } | null | undefined
  nik: string | null | undefined
  previous_sequence: {
    id: number
    name: string
    qty: number
  } | null | undefined
  vaccine_method: {
    id: number
    name: string
  } | null | undefined
  vaccine_type: {
    id: number
    name: string
  } | null | undefined
  entity: {
    id: number
    name: string
  } | null | undefined
} | null

export type ResponseMasterDataPatient = {
  item_per_page: number
  list_pagination: number[]
  page: number
  total_item: number
  total_page: number
  data: Array<{
    created_at: string
    deleted_at: null
    id: number
    title: string
    updated_at: string
  }>
}

export type HistoryMedical = {
  is_dengue_before: number | null | undefined
  dengue_received_vaccine: number | null | undefined
  last_dengue_diagnosis: string | null | undefined
  last_dengue_diagnosis_month: number | null | undefined
  last_dengue_diagnosis_year: number | null | undefined
}

type CommonObject = {
  id: number
  title: string
}

type Location = {
  province: TCommonObject | null
  regency: TCommonObject | null
  subdistrict: TCommonObject | null
  village: TCommonObject | null
  residential_province: TCommonObject | null
  residential_regency: TCommonObject | null
  residential_subdistrict: TCommonObject | null
  residential_village: TCommonObject | null
}

export type ResponseDataPatientNIK = {
  success: boolean
  message: string
  data: PatientIdentityNIK | null
}

export type PatientMedicalHistory = {
  is_diagnose_before: number
  month_before: number
  received_vaccine: number
  year_before: number
}

export type PatientIdentityNIK = {
  id?: number | null
  nik?: string | null
  name?: string | null
  gender?: number | null
  birth_date?: string | null
  marital_status?: CommonObject | null
  identity_type?: number | null
  phone_number?: string | null
  address?: string | null
  residential_address?: string | null
  pos_code?: string | null
  rt?: string | null
  rw?: string | null
  education?: CommonObject | null
  occupation?: CommonObject | null
  religion?: CommonObject | null
  ethnic?: CommonObject | null
  location?: Location
  entity_id?: number | null
  created_at?: string | null
  updated_at?: string | null
  medical_history?: PatientMedicalHistory | null
}

export type PatienVaccineSequence = {
  last_vaccine_date: string
  name: string
  next_sequence: {
    id: number
    name: string
    min: number
    max: number
  } | null
  next_vaccine_type: {
    id: number
    name: string
  } | null
  next_vaccine_method: {
    id: number
    name: string
  } | null
  nik: string
  previous_sequence: {
    id: number
    name: string
    qty: number
  }
  vaccine_method: {
    id: number
    name: string
  }
  vaccine_type: {
    id: number
    name: string
  }
  entity: {
    id: number
    name: string
  }
}

export type ResponsePatienVaccineSequence = {
  data: PatienVaccineSequence | null
  status: string
}

export type DataVaccineSequenceByProtocol = {
  id: number
  title: string
  min: number | null
  max: number | null
  ideal_age: number | null
  max_age: number | null
  active_duration: number | null
}

export type DataVaccineMethodByProtocol = {
  id: number
  title: string
  sequences: DataVaccineSequenceByProtocol[]
}

export type DataVaccineTypeByProtocol = {
  id: number
  title: string
  methods: MethodSequence[]
}

type Protocol = 'Rabies' | 'Dengue'

export type ListVaccineSequenceByProtocolResponse = {
  protocol: Protocol
  is_vaccine_type: boolean
  is_vaccine_method: boolean
  is_kipi: number
  is_medical_history: number
  data: DataVaccineTypeByProtocol[]
}

export type PatientLocation = {
  province: TCommonObject | null
  regency: TCommonObject | null
  subdistrict: TCommonObject | null
}

export type ResponseDataPatientLocation = {
  success: boolean
  data: PatientLocation | null
}
