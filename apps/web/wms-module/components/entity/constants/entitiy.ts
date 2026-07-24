import { TFunction } from 'i18next';

export function getEntityStatus(t: TFunction<['common', 'entityWMS']>) {
  return [
    {
      value: '1',
      label: t('entityWMS:list.filter.status.active'),
    },
    {
      value: '0',
      label: t('entityWMS:list.filter.status.inactive'),
    },
  ];
}
