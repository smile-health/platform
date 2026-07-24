import { loadEntityList, loadEntityWmsTagsList } from '@/services/entity';
import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
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
import { getTypeOfProcessing } from '../constants/user-activity.constant';

export default function userActivityFilterSchema(
  t: TFunction<'userActivity'>,
  lang?: string
) {
  return [
    {
      id: 'periode-date',
      type: 'month-year-picker',
      name: 'periode',
      label: t('form.period.label'),
      placeholder: t('form.period.placeholder'),
      defaultValue: null,
    },
    {
      id: 'select-waste-type',
      type: 'select-async-paginate',
      name: 'wasteTypeId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('filter.waste_type.label'),
      placeholder: t('filter.waste_type.placeholder'),
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
      label: t('filter.waste_group.label'),
      placeholder: t('filter.waste_group.placeholder'),
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
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinceActivity',
      label: t('form.province.label'),
      placeholder: t('form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regencyActivity'],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: !!getDefaultProvinceValue(),
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regencyActivity',
      label: t('form.regency.label'),
      placeholder: t('form.regency.placeholder'),
      loadOptions: loadRegencies,
      clearOnChangeFields: ['healthcareFacilityActivity'],
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('provinceActivity'),
        page: 1,
      }),
      defaultValue: getDefaultRegencyValue(),
      disabled: ({ getValue }) =>
        !getValue('provinceActivity') ||
        !!getDefaultRegencyValue() ||
        isProvinceManager(),
    },
    {
      id: 'select-primary-health-care',
      type: 'select-async-paginate',
      name: 'healthcareFacilityActivity',
      label: t('form.health_facilities.label'),
      placeholder: t('form.health_facilities.placeholder'),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '1,2,3,5',
        province_ids: getReactSelectValue('provinceActivity'),
        regency_ids: getReactSelectValue('regencyActivity'),
      }),
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
    {
      id: 'select-entity-tag',
      type: 'select-async-paginate',
      name: 'entityTag',
      label: t('filter.entity_tag.label'),
      placeholder: t('filter.entity_tag.placeholder'),
      loadOptions: loadEntityWmsTagsList,
      additional: {
        page: 1,
      },
      defaultValue: null,
      isMulti: true,
    },
    {
      id: 'select-type-of-processing',
      type: 'select',
      name: 'typeOfProcessing',
      className: 'ui-w-full',
      isMulti: false,
      label: t('filter.type_processing.label'),
      placeholder: t('filter.type_processing.placeholder'),
      options: getTypeOfProcessing(t),
      isUsingReactQuery: false,
      defaultValue: null,
    },
  ] satisfies UseFilter;
}
