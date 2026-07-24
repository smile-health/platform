import { loadEntityList } from '@/services/entity';
import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
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

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'transaction']>;
  userRole: ROLE_LABEL | null;
};

export const createFilterTransactionGroupSchema = ({
  t,
  userRole,
}: Params): UseFilter => {
  const filters: UseFilter = [
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('transaction:list.filter.search.label'),
      placeholder: t('transaction:list.filter.search.placeholder'),
      className: 'ui-w-full',
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'select-date-range',
      type: 'date-range-picker',
      name: 'dateRange',
      withPreset: true,
      multicalendar: true,
      clearable: false,
      label: t('transaction:list.filter.date_range.label'),
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinceId',
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['cityId'],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: ({ getValue }) =>
        !getValue('dateRange') || !!getDefaultProvinceValue(),
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'cityId',
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      disabled: ({ getValue }) =>
        !getValue('provinceId') ||
        !getValue('dateRange') ||
        !!getDefaultRegencyValue() ||
        isProvinceManager(),
      loadOptions: loadRegencies,
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('provinceId'),
        page: 1,
      }),
      defaultValue: getDefaultRegencyValue(),
    },
    {
      id: 'select-healthcare-facility-name',
      type: 'select-async-paginate',
      name: 'healthcareId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('transaction:list.filter.healthcare_facility_name.label'),
      placeholder: t(
        'transaction:list.filter.healthcare_facility_name.placeholder'
      ),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '1,2,3,5',
        province_ids: getReactSelectValue('provinceId'),
        regency_ids: getReactSelectValue('cityId'),
      }),
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
    {
      id: 'select-waste-type',
      type: 'select-async-paginate',
      name: 'wasteTypeId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('transaction:list.filter.waste_type.label'),
      placeholder: t('transaction:list.filter.waste_type.placeholder'),
      loadOptions: loadWasteByParentHierarchyId,

      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-waste-group',
      type: 'select-async-paginate',
      name: 'wasteGroupId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('transaction:list.filter.waste_group.label'),
      placeholder: t('transaction:list.filter.waste_group.placeholder'),
      loadOptions: loadWasteByParentHierarchyId,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('wasteTypeId') && {
          parent_hierarchy_id: getReactSelectValue('wasteTypeId'),
        }),
      }),
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('wasteTypeId'),
      defaultValue: null,
    },
    {
      id: 'select-waste-characteristic',
      type: 'select-async-paginate',
      name: 'wasteCharacteristicsId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('transaction:list.filter.waste_characteristic.label'),
      placeholder: t(
        'transaction:list.filter.waste_characteristic.placeholder'
      ),
      loadOptions: loadWasteByParentHierarchyId,
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('wasteGroupId') && {
          parent_hierarchy_id: getReactSelectValue('wasteGroupId'),
        }),
      }),
      disabled: ({ getReactSelectValue }) =>
        !getReactSelectValue('wasteGroupId'),
      defaultValue: null,
    },
  ];

  return filters;
};
