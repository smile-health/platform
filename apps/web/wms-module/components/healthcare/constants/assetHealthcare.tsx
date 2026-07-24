import { ActivityType } from '@/types/hf-asset-activity';

type BadgeColor =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'neutral';

export interface AssetHealthcare {
  value: string;
  label: string;
  color?: BadgeColor;
}

export const assetStatusValues = [
  { value: 'OPERATIONAL', color: 'success' },
  { value: 'UNDER_MAINTAINENCE', color: 'info' },
  { value: 'OUT_OF_SERVICE', color: 'danger' },
  { value: 'IDLE', color: 'warning' },
  { value: 'RETIRED', color: 'neutral' },
  { value: 'NEED_REPAIR', color: 'secondary' },
] as const;

export type AssetStatusOption = (typeof assetStatusValues)[number] & {
  label: string;
};

export const assetTypeList: AssetHealthcare[] = [
  { value: 'COLD_STORAGE', label: 'Cold Storage' },
  { value: 'INCINERATOR', label: 'Incinerator' },
  { value: 'AUTOCLAVE', label: 'Autoclave' },
  { value: 'SCALE', label: 'Scale' },
];

export const allowedActivity: ActivityType[] = [
  ActivityType.CALIBRATION,
  ActivityType.MAINTENANCE,
];
