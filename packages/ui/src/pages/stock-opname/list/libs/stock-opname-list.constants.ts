import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

export const DONE_SO = 1

export enum KFA_LEVEL {
  ACTIVE_SUBSTANCE_STRENGTH = 92,
  TRADEMARK = 93,
}

export enum MATERIAL_LEVEL {
  INGREDIENT = 1,
  TEMPLATE = 2,
  VARIANT = 3,
  PACKAGING = 4,
}

export const showZeroStockOptions = (
  t: TFunction<['common', 'stockOpname']>
) => [
  {
    value: BOOLEAN.TRUE,
    label: t('common:yes'),
  },
  {
    value: BOOLEAN.FALSE,
    label: t('common:no'),
  },
]

export const kfaLevelOptions = (t: TFunction<['common', 'stockOpname']>) => [
  {
    value: KFA_LEVEL.ACTIVE_SUBSTANCE_STRENGTH,
    label: `${t('stockOpname:others.active_substance_and_strength')} (92)`,
  },
  {
    value: KFA_LEVEL.TRADEMARK,
    label: `${t('stockOpname:others.trademark')} (93)`,
  },
]

export const requiredFilterFields = (
  t: TFunction<['common', 'stockOpname']>
) => [
  {
    name: 'period_id',
    errorMessage: t('stockOpname:form.stock_taking_period.required'),
  },
  {
    name: 'kfa_level',
    errorMessage: t('stockOpname:form.material_kfa_level.required'),
  },
]
