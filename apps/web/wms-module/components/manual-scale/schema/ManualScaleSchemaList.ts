import { loadEntityList } from '@/services/entity';
import { ROLE_LABEL } from '@/types/roles';
import {
  getDefaultHealthcareFacilityValue,
  getDefaultProvinceValue,
  getDefaultRegencyValue,
  isProvinceManager,
} from '@/utils/getUserRole';
import { UseFilter } from '@repo/ui/components/filter';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import * as yup from 'yup';
import { getManualScaleStatusOptions } from '../utils/helper';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'manualScale']>;
  userRole: ROLE_LABEL | null;
};

export const createFilterManualScaleGroupSchema = ({
  t,
  userRole,
}: Params): UseFilter => {
  const filters: UseFilter = [
    {
      id: 'select-date-range',
      type: 'date-range-picker',
      name: 'dateRange',
      withPreset: true,
      multicalendar: true,
      clearable: false,
      label: t('manualScale:list.filter.date_range.label'),
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinceManualScale',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regencyManualScale'],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: !!getDefaultProvinceValue(),
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regencyManualScale',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('provinceManualScale') ||
        !!getDefaultRegencyValue() ||
        isProvinceManager(),
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('provinceManualScale') && {
          parent_id: getReactSelectValue('provinceManualScale'),
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
      label: t('manualScale:list.filter.healthcare_facility_name.label'),
      placeholder: t(
        'manualScale:list.filter.healthcare_facility_name.placeholder'
      ),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '3',
        province_ids: getReactSelectValue('provinceManualScale'),
        regency_ids: getReactSelectValue('regencyManualScale'),
      }),
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
    {
      id: 'select-status',
      type: 'select',
      name: 'status',
      className: 'ui-w-full',
      isMulti: false,
      label: t('manualScale:list.filter.status.label'),
      placeholder: t('manualScale:list.filter.status.placeholder'),
      options: getManualScaleStatusOptions(),
      isUsingReactQuery: false,
      defaultValue: null,
    },
  ];

  return filters;
};
