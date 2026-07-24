import { loadEntityList } from '@/services/entity';
import {
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

export const createFilterHomeTPGroupSchema = ({ t }: Params): UseFilter => {
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
      clearOnChangeFields: ['regency_ids', 'sub_district_ids'],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: !!getDefaultProvinceValue(),
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'cityId',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('provinceId') || !!getDefaultRegencyValue(),
      clearOnChangeFields: ['sub_district_ids'],
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
      name: 'healthcareFacilityId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('home:home_tp.filter.healthcare_facility.label'),
      placeholder: t('home:home_tp.filter.healthcare_facility.placeholder'),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '1,2,3,5',
        province_ids: getReactSelectValue('provinceId'),
        regency_ids: getReactSelectValue('cityId'),
      }),
      defaultValue: null,
      disabled: ({ getValue }) => !getValue('dateRange'),
    },
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('home:home_tp.filter.search.label'),
      placeholder: t('home:home_tp.filter.search.placeholder'),
      className: 'ui-w-full ui-col-span-2',
      defaultValue: '',
      maxLength: 255,
    },
  ];

  return filters;
};
