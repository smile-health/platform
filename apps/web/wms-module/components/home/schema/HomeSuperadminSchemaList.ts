import { loadEntityList } from '@/services/entity';
import {
  getDefaultHealthcareFacilityValue,
  getDefaultProvinceValue,
  getDefaultRegencyValue,
} from '@/utils/getUserRole';
import { UseFilter } from '@repo/ui/components/filter';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'home']>;
};

export const createFilterSchema = ({ t }: Params): UseFilter => {
  const filters: UseFilter = [
    {
      id: 'select-date-range',
      type: 'date-range-picker',
      name: 'dateRange',
      withPreset: true,
      multicalendar: true,
      clearable: false,
      label: t('home:home_superadmin.filter.date_range.label'),
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
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
      name: 'healthcareFacilityName',
      className: 'ui-w-full',
      isMulti: false,
      label: t('home:home_superadmin.filter.healthcare_facility.label'),
      placeholder: t(
        'home:home_superadmin.filter.healthcare_facility.placeholder'
      ),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '3',
        province_ids: getReactSelectValue('provinceId'),
        regency_ids: getReactSelectValue('regencyId'),
      }),
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
  ];

  return filters;
};
