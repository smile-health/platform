import { THealthcareAsset } from '@/types/healthcare-asset';

export function handleDefaultValueHealthcare(defaultValue?: THealthcareAsset) {
  return {
    assetId: defaultValue?.assetId,
  };
}
