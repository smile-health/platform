import {
  GetManufactureDetailResponse,
  TManufacture,
} from '@/types/manufacture';

export function handleDefaultValue(
  defaultValue?: GetManufactureDetailResponse
) {
  const manufactureValue = defaultValue?.data as TManufacture;

  return {
    model: manufactureValue?.name || '',
    description: manufactureValue?.description || '',
    asset_type: manufactureValue?.assetType || '',
    manufacturer: manufactureValue?.manufacturer
      ? {
          label: manufactureValue?.manufacturer?.name || '',
          value: manufactureValue?.manufacturer?.id || '',
        }
      : null,
  };
}
