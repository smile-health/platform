import {
  WorkingStatusEnum,
  WorkingStatusOption,
} from '@/types/healthcare-asset';
import { TFunction } from 'i18next';

const { NEED_REPAIR, DAMAGED, REPAIR, STANDBY, FUNCTION, DISPOSED } =
  WorkingStatusEnum;

export const getWorkingStatus = (
  t: TFunction<'healthcareAsset'>
): Record<WorkingStatusEnum, WorkingStatusOption> => ({
  [FUNCTION]: {
    value: FUNCTION,
    label: t('working_status.function'),
    color: 'success',
  },
  [STANDBY]: {
    value: STANDBY,
    label: t('working_status.standby'),
    color: 'success',
  },
  [REPAIR]: {
    value: REPAIR,
    label: t('working_status.repair'),
    color: 'secondary',
  },
  [DAMAGED]: {
    value: DAMAGED,
    label: t('working_status.damaged'),
    color: 'danger',
  },
  [NEED_REPAIR]: {
    value: NEED_REPAIR,
    label: t('working_status.need_repair'),
    color: 'danger',
  },
  [DISPOSED]: {
    value: DISPOSED,
    label: t('working_status.disposed'),
    color: 'warning',
  },
});
