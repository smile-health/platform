import { TFunction } from "i18next";
import { CreateTransactionConsumptionPatient, FormDataPatient, PatientIdentityNIK, PatientMedicalHistory } from "../transaction-consumption.type"
import { UseFormClearErrors, UseFormSetValue } from "react-hook-form";
import { defaultDataHistoryMedical } from "../transaction-consumption.constant";

type HandleSetDataIdentityProps = {
  index: number;
  setValue: UseFormSetValue<FormDataPatient>
  clearErrors: UseFormClearErrors<FormDataPatient>
  t: TFunction<'transactionCreateConsumption'>
  data: PatientIdentityNIK
}

const isAddressMatched = (identity: CreateTransactionConsumptionPatient['identity']): boolean => {
  return !!identity.province?.value &&
    identity.residential_address === identity.registered_address &&
    identity.province_residential?.value === identity.province?.value &&
    identity.regency_residential?.value === identity.regency?.value &&
    identity.sub_district_residential?.value === identity.sub_district?.value &&
    identity.village_residential?.value === identity.village?.value
}

export const handleSetDataIdentity = ({ index, setValue, clearErrors, t, data }: HandleSetDataIdentityProps) => {
  const genderLabel = t('patient_identity.identity.gender.options', { returnObjects: true })

  const dataIdentity: CreateTransactionConsumptionPatient['identity'] = {
    full_name: data.name,
    gender: data.gender === 1 ? { value: 1, label: genderLabel[0] } : { value: 2, label: genderLabel[1] },
    birth_date: data.birth_date,
    ethnic: data.ethnic?.id ? { value: data.ethnic.id, label: data.ethnic.title } : null,
    last_education: data.education?.id ? { value: data.education.id, label: data.education.title } : null,
    phone_number: data.phone_number,
    province: data?.location?.province?.id ? { value: data.location.province.id, label: data.location.province.name } : null,
    regency: data?.location?.regency?.id ? { value: data.location.regency.id, label: data.location.regency.name } : null,
    sub_district: data?.location?.subdistrict?.id ? { value: data.location.subdistrict.id, label: data.location.subdistrict.name } : null,
    village: data?.location?.village?.id ? { value: data.location.village.id, label: data.location.village.name } : null,
    religion: data.religion?.id ? { value: data.religion.id, label: data.religion.title } : null,
    occupation: data.occupation?.id ? { value: data.occupation.id, label: data.occupation.title } : null,
    registered_address: data.address,
    is_matched_address: 0,
    residential_address: data.residential_address,
    province_residential: data?.location?.residential_province?.id ? { value: data.location.residential_province.id, label: data.location.residential_province.name } : null,
    regency_residential: data?.location?.residential_regency?.id ? { value: data.location.residential_regency.id, label: data.location.residential_regency.name } : null,
    sub_district_residential: data?.location?.residential_subdistrict?.id ? { value: data.location.residential_subdistrict.id, label: data.location.residential_subdistrict.name } : null,
    village_residential: data?.location?.residential_village?.id ? { value: data.location.residential_village.id, label: data.location.residential_village.name } : null,
    marital_status: data.marital_status?.id ? { value: data.marital_status.id, label: data.marital_status.title } : null,
  }

  if (isAddressMatched(dataIdentity)) {
    dataIdentity.is_matched_address = 1
  }

  setValue(`data.${index}.identity`, dataIdentity)
  setValue(`data.${index}.patient`, data)
  clearErrors(`data.${index}.identity`)
}

type HandleSetDataHistoryMedicalProps = {
  index: number;
  setValue: UseFormSetValue<FormDataPatient>
  clearErrors: UseFormClearErrors<FormDataPatient>
  data: PatientMedicalHistory
}
export const handleSetDataHistoryMedical = ({ index, setValue, clearErrors, data }: HandleSetDataHistoryMedicalProps) => {
  const dataHistoryMedical = {
    ...defaultDataHistoryMedical,
    is_dengue_before: data.is_diagnose_before,
    last_dengue_diagnosis_month: data.month_before,
    last_dengue_diagnosis_year: data.year_before,
    dengue_received_vaccine: data.received_vaccine,
  }

  setValue(`data.${index}.history_medical`, dataHistoryMedical)
  clearErrors(`data.${index}.history_medical`)
}