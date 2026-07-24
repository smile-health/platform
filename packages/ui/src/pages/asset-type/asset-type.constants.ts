import { TFunction } from 'i18next'

export const assetTypeIsCCEEquipment = (t: TFunction<['assetType']>) => [
  {
    id: 1,
    name: t('form.detail.is_cce_equipment.radio.yes'),
  },
  {
    id: 0,
    name: t('form.detail.is_cce_equipment.radio.no'),
  },
]

export const defaultHumidity = [
  {
    min_humidity: process.env.MIN_HUMIDITY_THRESHOLD ?? 60,
    max_humidity: process.env.MAX_HUMIDITY_THRESHOLD ?? 80,
  },
]

export enum ThresholdType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
}

export const IMPORT_CONFIGS = [
  {
    id: 'btn-import-asset-type-cee',
    type: 'asset_type_cce',
    templateType: 1,
  },
  {
    id: 'btn-import-asset-type-warehouse',
    type: 'asset_type_warehouse',
    templateType: 2,
  },
] as const
