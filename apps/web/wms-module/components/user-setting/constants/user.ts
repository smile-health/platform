import { TFunction } from 'i18next';

export function getEntityStatus(t: TFunction<['common', 'userSetting']>) {
  return [
    {
      value: '1',
      label: t('userSetting:filter.status.active'),
    },
    {
      value: '0',
      label: t('userSetting:filter.status.inactive'),
    },
  ];
}
