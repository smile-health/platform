import { TFunction } from 'i18next';

import UserActivityChart from '../components/UserActivityChart';
import UserActivityTable from '../components/UserActivityTable';

export const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf'];

export function getUserActivityTabs(t: TFunction<'userActivity'>) {
  return [
    {
      id: 'overview',
      label: t('title.tab.overview'),
      component: UserActivityChart,
    },
    {
      id: 'entity',
      label: t('title.tab.entity'),
      component: UserActivityTable,
    },
  ];
}

export function getTypeOfProcessing(t: TFunction<'userActivity'>) {
  return [
    {
      value: 'IN',
      label: t('title.type_processing.internal'),
    },
    {
      value: 'EX',
      label: t('title.type_processing.external'),
    },
  ];
}
