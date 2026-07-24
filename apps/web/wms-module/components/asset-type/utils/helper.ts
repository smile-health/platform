import { TAssetType } from '@/types/asset-type';

export function handleDefaultValue(defaultValue?: TAssetType) {
  return {
    name: defaultValue?.name || '',
    description: defaultValue?.description || '',
    maxTemperature: defaultValue?.maxTemperature || '',
    minTemperature: defaultValue?.minTemperature || '',
  };
}
