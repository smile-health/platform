import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'
import { CreateTransactionConsumptionPatient } from './transaction-consumption.type'

export enum IDENTITY_TYPE_VALUE {
  NIK = 1,
  NONNIK = 2,
}

export const IDENTITY_TYPE = (
  t: TFunction<['transactionCreateConsumption']>
) => [
    {
      value: IDENTITY_TYPE_VALUE.NIK,
      label: t('nik'),
    },
    {
      value: IDENTITY_TYPE_VALUE.NONNIK,
      label: t('non_nik'),
    },
  ]

export enum VACCINE_METHOD {
  INTRA_MUSCULAR = 1,
  INTRA_DERMAL = 2,
}

export enum VACCINE_PROTOCOL {
  RABIES = 1,
  DENGUE = 2,
}

export enum REACTION_AFTER_DENGUE {
  OTHERS = 4,
}

export const MAX_LIMIT_PATIENT_INTRA_DERMAL = 5

export const defaultDataIdentity = {
  ethnic: null,
  full_name: null,
  gender: null,
  last_education: null,
  phone_number: null,
  province: null,
  regency: null,
  sub_district: null,
  village: null,
  religion: null,
  registered_address: null,
  is_matched_address: null,
  province_residential: null,
  regency_residential: null,
  sub_district_residential: null,
  village_residential: null,
  residential_address: null,
  marital_status: null,
  occupation: null,
  birth_date: null,
}

export const defaultDataPatient = {
  id: 0,
  name: null,
  gender: null,
  birth_date: null,
  marital_status: null,
  identity_type: null,
  phone_number: null,
  address: null,
  residential_address: null,
  created_at: null,
  updated_at: null,
  entity_id: null,
  location: {
    province: null,
    regency: null,
    subdistrict: null,
    village: null,
  },
  education: null,
  occupation: null,
  religion: null,
  ethnic: null,
  pos_code: null,
  rt: null,
  rw: null,
  nik: null,
}

export const defaultDataHistoryMedical = {
  is_dengue_before: null,
  last_dengue_diagnosis: null,
  last_dengue_diagnosis_month: null,
  last_dengue_diagnosis_year: null,
  dengue_received_vaccine: null
}

export const defaultDataFormVaccine = ({
  isVaccine,
  isNeedSequence,
  t,
  protocol,
  isKipi,
  isMedicalHistory,
}: {
  isVaccine: number | null | undefined,
  isNeedSequence: number | null | undefined,
  t: TFunction<['transactionCreateConsumption']>,
  protocol?: number | null,
  isKipi?: number | null,
  isMedicalHistory?: number | null,
}): CreateTransactionConsumptionPatient => ({
  is_vaccine: isVaccine,
  protocol_id: protocol,
  is_medical_history: isMedicalHistory,
  vaccination: {
    is_kipi: isKipi,
    is_vaccine: isVaccine,
    identity_type: protocol === VACCINE_PROTOCOL.DENGUE ? IDENTITY_TYPE(t)[0] : null,
    patient_id: null,
    vaccine_sequence: null,
    is_need_sequence: isNeedSequence,
    vaccine_type: null,
    vaccine_method: null,
    other_reaction: null,
    reaction_id: null,
    is_valid_patient: 1,
  },
  identity: defaultDataIdentity,
})

export const optionsMonths = (
  t: TFunction<['transactionCreateConsumption']>
) => {
  const months: OptionType[] = []

  for (let i = 1; i <= 12; i++) {
    months.push({
      value: i,
      label: t('patient_identity.history_medical.month', { returnObjects: true })[i - 1],
    })
  }

  return months
}

export function optionsYears(range: number = 25): OptionType[] {
  const currentYear = new Date().getFullYear();
  const start = currentYear - range;

  const years: number[] = [];
  for (let year = start; year <= currentYear; year++) {
    years.push(year);
  }

  return years.map(x => ({ label: x.toString(), value: x }));
}