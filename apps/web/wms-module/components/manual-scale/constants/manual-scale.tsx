import { ManualScaleStatus } from '@/types/manual-scale';

export const ManualScaleStatusValues = [
  { value: ManualScaleStatus.APPROVED, color: 'success' },
  { value: ManualScaleStatus.REJECTED, color: 'danger' },
  { value: ManualScaleStatus.PENDING, color: 'warning' },
  { value: ManualScaleStatus.WAITING_FOR_APPROVAL, color: 'info' },
  { value: ManualScaleStatus.EXPIRED, color: 'neutral' },
] as const;
