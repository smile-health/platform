import { THealthcare } from '@/types/healthcare';
import { TFunction } from 'i18next';
import {
  AssetHealthcare,
  AssetStatusOption,
  assetStatusValues,
  assetTypeList,
} from '../constants/assetHealthcare';

export function handleDefaultValueHealthcare(defaultValue?: THealthcare) {
  return {
    healthcare_facility: defaultValue?.healthcareFacilityId
      ? {
          value: defaultValue?.healthcareFacilityId,
          label: defaultValue?.healthcareFacilityName ?? '',
        }
      : null,
    assetType: defaultValue?.assetModel?.assetType,
    manufacture: defaultValue?.assetModel?.manufacturer?.id
      ? {
          value: defaultValue?.assetModel?.manufacturer?.id,
          label: defaultValue?.assetModel?.manufacturer?.name ?? '',
        }
      : null,
    model: defaultValue?.assetModel?.id
      ? {
          value: defaultValue?.assetModel?.id,
          label: defaultValue?.assetModel?.name ?? '',
        }
      : null,
    assetId: defaultValue?.assetId,
    isIotEnable: defaultValue?.isIotEnable ?? false,
    assetStatus: defaultValue?.assetStatus,
    yearOfProduction: defaultValue?.yearOfProduction ?? 0,
    warrantyStartDate: defaultValue?.warrantyStartDate,
    warrantyEndDate: defaultValue?.warrantyEndDate,
  };
}

export const getAssetStatusOptions = (
  t: TFunction<'healthCare'>
): AssetStatusOption[] => {
  return assetStatusValues.map((status) => ({
    ...status,
    label: t(`asset_status.${status.value}`),
  }));
};

export const getAssetTypeOptions = (t: TFunction): AssetHealthcare[] => {
  return assetTypeList.map((value) => ({
    ...value,
    label: t(`asset_type.${value.value}`, value.label),
  }));
};
