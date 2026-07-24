import { loadEntityList } from '@/services/entity';
import { loadNotificationTypes } from '@/services/notification';
import {
  getDefaultHealthcareFacilityValue,
  getDefaultProvinceValue,
  getDefaultRegencyValue,
} from '@/utils/getUserRole';
import { UseFilter } from '@repo/ui/components/filter';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import { TFunction } from 'i18next';

type Params = {
  t: TFunction<['common', 'notification']>;
  isPageNotification: boolean;
};

export const notificationFilterFormSchema = ({
  t,
  isPageNotification,
}: Params): UseFilter => {
  const filters: UseFilter = [
    {
      id: 'notification_type',
      type: 'select-async-paginate',
      name: 'notification_type',
      isMulti: false,
      label: t('notification:filter.notification_type.label'),
      placeholder: t('notification:filter.notification_type.placeholder'),
      loadOptions: loadNotificationTypes,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-date-range',
      type: 'date-range-picker',
      name: 'dateRangeNotification',
      withPreset: true,
      multicalendar: true,
      label: t('notification:filter.receive_date.label'),
      defaultValue: null,
      className: 'ui-w-full',
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinceId',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regencyId'],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: !!getDefaultProvinceValue(),
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regencyId',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('provinceId') || !!getDefaultRegencyValue(),
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('provinceId') && {
          parent_id: getReactSelectValue('provinceId'),
        }),
      }),
      defaultValue: getDefaultRegencyValue(),
    },
    {
      id: 'select-healthcare-facility-name',
      type: 'select-async-paginate',
      name: 'entityId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('common:form.healthcare_facility_name.label'),
      placeholder: t('common:form.healthcare_facility_name.placeholder'),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '1,2,3,5',
        province_ids: getReactSelectValue('provinceId'),
        regency_ids: getReactSelectValue('regencyId'),
      }),
      defaultValue: isPageNotification
        ? getDefaultHealthcareFacilityValue()
        : null,
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
  ];

  return filters;
};
