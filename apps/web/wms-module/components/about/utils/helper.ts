import { TEntitiesWms } from '@/types/entity';

export function handleDefaultValue(defaultValue?: TEntitiesWms) {
  return {
    nib: defaultValue?.nib ?? '',
    headName: defaultValue?.head_name ?? '',
    gender: defaultValue?.gender ?? 1,
    email: defaultValue?.email ?? '',
    phone: defaultValue?.mobile_phone ?? '',
    totalBedroom: defaultValue?.total_bad_room?.toString() ?? null,
    percentageBedroom: defaultValue?.percentage_bad_room?.toString() ?? null,
  };
}
