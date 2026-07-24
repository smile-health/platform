import { TPartnershipVehicle } from '@/types/partnership-vehicle';
import { vehicleTypes } from '../constants/partnershipVehicle';

export function handleDefaultValuePartnershipVehicle(
  defaultValue?: TPartnershipVehicle,
  isEdit: boolean = false
) {
  let entity;
  if (isEdit && defaultValue?.entityId) {
    entity = {
      value: defaultValue.entityId,
      label: defaultValue.entityName ?? '',
    };
  } else if (isEdit) {
    entity = null;
  } else {
    entity = [];
  }

  return {
    vehicleType: defaultValue?.vehicleType,
    vehicleNumber: defaultValue?.vehicleNumber,
    capacityInKgs: defaultValue?.capacityInKgs,
    entity,
  };
}

export function getVehicleTypeLabel(value: string) {
  return vehicleTypes.find((x) => x.value === value)?.label ?? '-';
}

export function formatVehicleNumber(value: string): string {
  const cleaned = (value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = cleaned.match(/^([A-Z]*)(\d*)([A-Z]*)/);
  if (!match) return cleaned;
  const region = (match[1] ?? '').slice(0, 3);
  const number = (match[2] ?? '').slice(0, 4);
  const suffix = (match[3] ?? '').slice(0, 3);
  return [region, number, suffix].filter(Boolean).join(' ');
}
