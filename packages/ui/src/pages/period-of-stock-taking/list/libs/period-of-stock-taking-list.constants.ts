import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

export enum MONTH {
  JANUARY = 1,
  FEBRUARY = 2,
}

export const periodStatus = (
  t: TFunction<['common', 'periodOfStockTaking']>
) => [
  {
    value: BOOLEAN.TRUE,
    label: t('periodOfStockTaking:active'),
  },
  {
    value: BOOLEAN.FALSE,
    label: t('periodOfStockTaking:inactive'),
  },
]
