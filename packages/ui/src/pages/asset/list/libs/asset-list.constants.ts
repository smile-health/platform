import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

export enum TEMP_LOGGER {
  NORMAL = 1,
  ABOVE_MAX = 2,
  BELOW_MIN = 3,
}

export enum ASSET_TYPE {
  VACCINE_REFRIGERATOR = 1,
  FREEZER = 2,
  COLD_ROOM = 3,
  FREEZER_ROOM = 4,
  REMOTE_TEMPERATURE_MONITORING = 7,
  ULTRA_LOW_TEMPERATURE = 12,
  VACCINE_CARRIER = 14,
  CONTINUE_TEMPERATURE_MONITORING = 16,
  FREEZE_INDICATOR = 17,
}

export const assetTypeDefaults = (t: TFunction<['common', 'asset']>) => [
  {
    value: ASSET_TYPE.VACCINE_REFRIGERATOR,
    label: t('asset:asset_type_default.vaccine_refrigerator'),
  },
  {
    value: ASSET_TYPE.COLD_ROOM,
    label: t('asset:asset_type_default.cold_room'),
  },
  {
    value: ASSET_TYPE.FREEZER,
    label: t('asset:asset_type_default.freezer'),
  },
]

export const showZeroStockOptions = (t: TFunction<['common', 'asset']>) => [
  {
    value: BOOLEAN.TRUE,
    label: t('common:yes'),
  },
  {
    value: BOOLEAN.FALSE,
    label: t('common:no'),
  },
]

export const assetRelation = (t: TFunction<['common', 'asset']>) => [
  {
    value: BOOLEAN.TRUE,
    label: t('asset:relationship.with_relation'),
  },
  {
    value: BOOLEAN.FALSE,
    label: t('asset:relationship.without_relation'),
  },
]

export const tempLoaggerOptions = (t: TFunction<['common', 'asset']>) => [
  {
    value: TEMP_LOGGER.NORMAL,
    label: t('asset:temperature_logger.normal'),
  },
  {
    value: TEMP_LOGGER.ABOVE_MAX,
    label: t('asset:temperature_logger.above_maximum'),
  },
  {
    value: TEMP_LOGGER.BELOW_MIN,
    label: t('asset:temperature_logger.below_minimum'),
  },
]
