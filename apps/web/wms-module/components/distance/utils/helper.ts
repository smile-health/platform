import { TEntitySettings } from '@/types/entity-settings';

export function handleDefaultValueEntitySettings(
  defaultValue?: TEntitySettings
) {
  return {
    distance_limit: defaultValue
      ? Number(defaultValue?.settingValue ?? '0')
      : 0,
  };
}
