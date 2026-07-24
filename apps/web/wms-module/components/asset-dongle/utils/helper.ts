import { TAssetDongle } from '@/types/asset-dongle';

export function handleDefaultValueHealthcare(defaultValue?: TAssetDongle) {
  return {
    assetId: defaultValue?.assetId,
  };
}
