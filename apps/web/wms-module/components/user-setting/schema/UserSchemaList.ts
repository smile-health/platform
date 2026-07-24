import { UseFilter } from '@repo/ui/components/filter';
import { getGlobalEntityType } from '@repo/ui/services/entity';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import { TFunction } from 'i18next';
import { getEntityStatus } from '../constants/user';
import { loadUserRole } from '@/services/role';

type Params = {
  t: TFunction<['common', 'userSetting']>;
};

export const createFilterSchema = ({ t }: Params): UseFilter => [
  {
    id: 'input-search',
    type: 'text',
    name: 'search',
    label: t('userSetting:filter.search.label'),
    placeholder: t('userSetting:filter.search.placeholder'),
    className: '',
    defaultValue: '',
  },
  {
    id: 'select-province',
    type: 'select-async-paginate',
    name: 'provinceId',
    isMulti: false,
    label: t('common:form.province.label'),
    placeholder: t('common:form.province.placeholder'),
    loadOptions: loadProvinces,
    clearOnChangeFields: ['regencyId', 'sub_district_ids'],
    additional: { page: 1 },
    defaultValue: null,
  },
  {
    id: 'select-regency',
    type: 'select-async-paginate',
    name: 'regencyId',
    isMulti: false,
    label: t('common:form.city.label'),
    placeholder: t('common:form.city.placeholder'),
    loadOptions: loadRegencies,
    disabled: ({ getReactSelectValue }) => !getReactSelectValue('provinceId'),
    clearOnChangeFields: ['sub_district_ids'],
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('provinceId') && {
        parent_id: getReactSelectValue('provinceId'),
      }),
    }),
    defaultValue: null,
  },
  {
    id: 'select-type',
    type: 'select',
    name: 'entityTypeId',
    isMulti: false,
    label: t('userSetting:filter.type.label'),
    placeholder: t('userSetting:filter.type.placeholder'),
    className: '',
    defaultValue: null,
    loadOptions: async () => {
      let result = await getGlobalEntityType({ page: 1, paginate: 100 });

      return result.data.map((x) => ({ value: x.id, label: x.name })) || [];
    },
  },
  {
    id: 'select-status',
    type: 'select',
    name: 'isActive',
    className: 'ui-w-full',
    isMulti: false,
    label: t('userSetting:filter.status.label'),
    placeholder: t('userSetting:filter.status.placeholder'),
    options: getEntityStatus(t),
    isUsingReactQuery: false,
    defaultValue: null,
  },
  {
    id: 'select-role',
    type: 'select-async-paginate',
    name: 'roleType',
    isMulti: false,
    label: t('userSetting:filter.role.label'),
    placeholder: t('userSetting:filter.role.placeholder'),
    loadOptions: loadUserRole,
    additional: { page: 1 },
    defaultValue: null,
  },
];
