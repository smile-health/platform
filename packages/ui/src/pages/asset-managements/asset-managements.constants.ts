import { OptionType } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

export const anotherOption = (
  t: TFunction<['assetManagements']>
): OptionType[] => [
  {
    label: t('assetManagements:columns.asset_type.other_option'),
    value: 'other',
  },
]

export enum RELATION_TYPE {
  TEMPERATURE_MONITORING_DEVICE = 'rtmds',
  OPERATIONAL_ASSET_INVENTORY = 'ops',
  STORAGE_TEMPERATURE_MONITORING = 'temp',
}

export enum WORKING_STATUS_ENUM {
  NEED_REPAIR = 9,
  UNSUBSCRIBED = 8,
  NOT_USED = 7,
  DEFROSTING = 6,
  UNREPAIRABLE = 5,
  DAMAGED = 4,
  REPAIR = 3,
  STANDBY = 2,
  FUNCTION = 1,
}

export enum OWNERSHIP_STATUS_ENUM {
  OWNED = 0,
  BORROWED = 1,
}

export enum ASSET_MANAGEMENTS_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum RELATION_TYPE {
  RTMDS = 'rtmds',
  OPS = 'ops',
}

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

export const assetTypeDefaults = (
  t: TFunction<['common', 'assetManagements']>
) => [
  {
    value: ASSET_TYPE.VACCINE_REFRIGERATOR,
    label: t('assetManagements:asset_type_default.vaccine_refrigerator'),
  },
  {
    value: ASSET_TYPE.COLD_ROOM,
    label: t('assetManagements:asset_type_default.cold_room'),
  },
  {
    value: ASSET_TYPE.FREEZER,
    label: t('assetManagements:asset_type_default.freezer'),
  },
]

export const showZeroStockOptions = (
  t: TFunction<['common', 'assetManagements']>
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

export const loggerRelation = (
  t: TFunction<['common', 'assetManagements']>
) => [
  {
    value: BOOLEAN.TRUE,
    label: t('assetManagements:relationship.with_relation'),
  },
  {
    value: BOOLEAN.FALSE,
    label: t('assetManagements:relationship.without_relation'),
  },
]

export const tempLoggerOptions = (
  t: TFunction<['common', 'assetManagements']>
) => [
  {
    value: TEMP_LOGGER.NORMAL,
    label: t('assetManagements:temperature_logger.normal'),
  },
  {
    value: TEMP_LOGGER.ABOVE_MAX,
    label: t('assetManagements:temperature_logger.above_maximum'),
  },
  {
    value: TEMP_LOGGER.BELOW_MIN,
    label: t('assetManagements:temperature_logger.below_minimum'),
  },
]
