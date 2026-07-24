import {
  GetEntityLocationResponse,
  TEntityLocation,
} from '@/types/entity-location';

export function handleDefaultValue(defaultValue?: GetEntityLocationResponse) {
  const entityLocation = defaultValue?.data as TEntityLocation;

  return {
    locationName: entityLocation?.locationName || '',
    latitude: entityLocation?.latitude || '',
    longitude: entityLocation?.longitude || '',
    distanceLimitInMeters: entityLocation?.distanceLimitInMeters || 0,
    address: entityLocation?.address || '',
    province: entityLocation?.provinceId
      ? {
          value: entityLocation?.provinceId || 0,
          label: entityLocation?.provinceName || '',
        }
      : null,
    city: entityLocation?.cityId
      ? {
          value: entityLocation?.cityId || 0,
          label: entityLocation?.cityName || '',
        }
      : null,
  };
}
