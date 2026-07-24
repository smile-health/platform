import {
  GetEntityStorageLocationResponse,
  TEntityLocation,
} from '@/types/entity-location';

export function handleDefaultValueEntityLocation(
  defaultValue?: GetEntityStorageLocationResponse
) {
  const entityLocation = defaultValue?.data[0] as TEntityLocation;

  return {
    locationName: entityLocation?.locationName || '',
    latitude: entityLocation?.latitude || '',
    longitude: entityLocation?.longitude || '',
    distanceLimitInMeters: entityLocation?.distanceLimitInMeters || 0,
    address: entityLocation?.address || '',
    province: {
      value: entityLocation?.provinceId || 0,
      label: entityLocation?.provinceName || '',
    },
    city: {
      value: entityLocation?.cityId || 0,
      label: entityLocation?.cityName || '',
    },
  };
}
