import { TPartnership } from '@/types/partnership';

export function handleDefaultValueHealthcarePartner(
  defaultValue?: TPartnership
) {
  return {
    partnershipStatus: defaultValue?.partnershipStatus,
    picName: defaultValue?.picName,
    picPhoneNumber: defaultValue?.picPhoneNumber,
    picPosition: defaultValue?.picPosition,
  };
}
