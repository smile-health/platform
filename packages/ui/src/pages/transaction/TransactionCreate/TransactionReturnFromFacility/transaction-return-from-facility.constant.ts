import { TFunction } from 'i18next'

export enum STOCK_DETAIL_GROUP_BY {
  ACTIVITY = 'activity',
  MATERIAL = 'material',
}

export enum TRANSACTION_REASON {
  OTHER_RETURN_FROM_FACILITY = 16,
}

export enum VALIDATION_FROM {
  stock_consumptions_LEVEL_ARRAY = 0,
  MATERIALS_LEVEL_ARRAY = 1,
  TRANSACTION_LEVEL_OBJECT = 2,
}

export enum ID_TYPE {
  NIK = 1,
  PASSPORT = 2,
}

export const transactionPatientIdType = (
  value: ID_TYPE,
  t: TFunction<['transactionCreate', 'common']>
) => {
  switch (value) {
    case ID_TYPE.NIK:
      return t(
        'transactionCreate:transaction_return_from_facility.patient_part.nik'
      )
    case ID_TYPE.PASSPORT:
      return t(
        'transactionCreate:transaction_return_from_facility.patient_part.passport'
      )
    default:
      return '-'
  }
}

export default {}
