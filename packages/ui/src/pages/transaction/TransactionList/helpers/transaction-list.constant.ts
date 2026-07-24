import { TFunction } from 'i18next'

export enum TRANSACTION_ORDER_TYPE {
  REQUEST = 1,
  DISTRIBUTION = 2,
  RETURN = 3,
  CENTRAL_DISTRIBUTION = 4,
  RELOCATION = 7,
}

export enum MATERIAL_LEVEL {
  INGREDIENT = 1,
  TEMPLATE = 2,
  VARIANT = 3,
  PACKAGING = 4,
}

export const orderTypeOptions = (
  t: TFunction<['common', 'transactionList']>
) => [
  {
    value: TRANSACTION_ORDER_TYPE.REQUEST,
    label: t('common:order.type.order'),
  },
  {
    value: TRANSACTION_ORDER_TYPE.DISTRIBUTION,
    label: t('common:order.type.distribution'),
  },
  {
    value: TRANSACTION_ORDER_TYPE.RETURN,
    label: t('common:order.type.return'),
  },
  {
    value: TRANSACTION_ORDER_TYPE.CENTRAL_DISTRIBUTION,
    label: t('common:order.type.central_distribution'),
  },
  {
    value: TRANSACTION_ORDER_TYPE.RELOCATION,
    label: t('common:order.type.relocation'),
  },
]

export enum DEVICE_TYPE {
  WEB = 1,
  MOBILE = 2,
}

export const deviceTypeOptions = (
  t: TFunction<['common', 'transactionList']>
) => [
  { value: DEVICE_TYPE.WEB, label: t('transactionList:columns.web') },
  {
    value: DEVICE_TYPE.MOBILE,
    label: t('transactionList:columns.mobile_phone'),
  },
]

enum PATIENT_IDENTITY_TYPE {
  NIK = 1,
  PASSPORT = 2,
}

export const patientIdentityTypeOptions = (
  t: TFunction<['common', 'transactionList']>
) => [
  {
    value: PATIENT_IDENTITY_TYPE.NIK,
    label: t('transactionList:patient_columns.nik'),
  },
  {
    value: PATIENT_IDENTITY_TYPE.PASSPORT,
    label: t('transactionList:patient_columns.passport'),
  },
]

export enum PROGRAM {
  IMMUNIZATION = 1,
  ESSENTIAL_DRUGS = 2,
}

export default {}
