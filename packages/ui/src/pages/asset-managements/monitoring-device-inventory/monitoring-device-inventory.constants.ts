import { TFunction } from 'i18next'

export enum MONITORING_DEVICE_INVENTORY_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
}

export const IS_INVENTORY = true

export const ASSET_TYPE_RTMD_ID = 6
export const MAX_STRING_LENGTH = 255

export const CONTACT_PERSON_INDICES = {
  FIRST: 0,
  SECOND: 1,
  THIRD: 2,
} as const

export const monitoringDeviceInventoryStatus = (
  t: TFunction<['common', 'monitoringDeviceInventory']>
) => [
  {
    value: MONITORING_DEVICE_INVENTORY_STATUS.INACTIVE,
    label: t('common:status.inactive'),
  },
  {
    value: MONITORING_DEVICE_INVENTORY_STATUS.ACTIVE,
    label: t('common:status.active'),
  },
]
