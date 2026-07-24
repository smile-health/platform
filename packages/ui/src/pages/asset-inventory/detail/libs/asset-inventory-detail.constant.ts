import { TFunction } from 'i18next'

export enum OWNERSHIP_STATUS {
  OWNED = 1,
  BORROWED = 2,
}

export const assetOpnameTresholdTemp = (
  t: TFunction<['common', 'assetInventory']>
) => [
  {
    value: 'min_temperature',
    label: t('assetInventory:temperature_logger.minimum'),
  },
  {
    value: 'max_temperature',
    label: t('assetInventory:temperature_logger.maximum'),
  },
]

export const assetOpnameModelCapacity = (
  t: TFunction<['common', 'assetInventory']>
) => [
  {
    value: 'gross_capacity',
    label: t('assetInventory:capacity.gross_capacity'),
  },
  {
    value: 'net_capacity',
    label: t('assetInventory:capacity.netto_capacity'),
  },
]

export const assetOpnameOwnershipStatus = (
  t: TFunction<['common', 'assetInventory']>
) => [
  {
    value: OWNERSHIP_STATUS.OWNED,
    label: t('assetInventory:ownership.owned'),
  },
  {
    value: OWNERSHIP_STATUS.BORROWED,
    label: t('assetInventory:ownership.borrowed'),
  },
]
