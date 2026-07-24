import { BOOLEAN } from '#constants/common'
import { TFunction } from 'i18next'

export enum AssetUtilization {
  Cce = 'cce',
  Warehouse = 'warehouse',
  Other = 'other',
}

export const assetUtilizationSelections = (t: TFunction<['modelAsset']>) => [
  {
    label: t('modelAsset:form.detail.label.asset_utilization.is_cce'),
    value: {
      id: AssetUtilization.Cce,
      is_warehouse: BOOLEAN.FALSE,
      is_cce: BOOLEAN.TRUE,
    },
    id: AssetUtilization.Cce,
  },
  {
    label: t('modelAsset:form.detail.label.asset_utilization.is_warehouse'),
    value: {
      id: AssetUtilization.Warehouse,
      is_warehouse: BOOLEAN.TRUE,
      is_cce: BOOLEAN.FALSE,
    },
    id: AssetUtilization.Warehouse,
  },
  {
    label: t('modelAsset:form.detail.label.asset_utilization.other'),
    value: {
      id: AssetUtilization.Other,
      is_warehouse: BOOLEAN.FALSE,
      is_cce: BOOLEAN.FALSE,
    },
    id: AssetUtilization.Other,
  },
]

export const capacityFields = (temperatureThresholds: number[]) => [
  {
    id: 'capacities5',
    label: 'capacities5',
    category: '+5',
    temperature_threshold_id: temperatureThresholds[0],
  },
  {
    id: 'capacitiesMin20',
    label: 'capacitiesMin20',
    category: '-20',
    temperature_threshold_id: temperatureThresholds[1],
  },
  {
    id: 'capacitiesMin86',
    label: 'capacitiesMin86',
    category: '-86',
    temperature_threshold_id: temperatureThresholds[2],
  },
]

export const ordinalWords = {
  1: '1st',
  2: '2nd',
  3: '3rd',
}

export enum PopupImportType {
  ModelAssetCceWithPqs = 'model_asset_cce_with_pqs',
  ModelAssetCceWithoutPqs = 'model_asset_cce_without_pqs',
  ModelAssetNonCce = 'model_asset_non_cce',
  ModelAssetWarehouse = 'model_asset_warehouse',
}

export const IMPORT_CONFIGS = [
  {
    id: 'btn-import-model-asset-cce-with-pqs',
    type: PopupImportType.ModelAssetCceWithPqs,
    templateType: 1,
  },
  {
    id: 'btn-import-model-asset-cce-without-pqs',
    type: PopupImportType.ModelAssetCceWithoutPqs,
    templateType: 2,
  },
  {
    id: 'btn-import-model-asset-non-cce',
    type: PopupImportType.ModelAssetNonCce,
    templateType: 3,
  },
  {
    id: 'btn-import-model-asset-warehouse',
    type: PopupImportType.ModelAssetWarehouse,
    templateType: 4,
  },
] as const
