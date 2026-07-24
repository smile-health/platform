import { loadEntityList, loadEntityWmsTagsList } from '@/services/entity';
import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { UseFilter } from '@repo/ui/components/filter';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';
import { informationTypeList } from '../constants/transaction-monitoring.constant';
import {
  getDefaultHealthcareFacilityValue,
  getDefaultProvinceValue,
  getDefaultRegencyValue,
  isProvinceManager,
} from '@/utils/getUserRole';

export default function dashboardTransactionMonitoringFilterSchema(
  t: TFunction<'transactionMonitoring'>,
  lang?: string
) {
  return [
    {
      id: 'select-date-range',
      type: 'date-range-picker',
      name: 'dateRange',
      withPreset: true,
      multicalendar: true,
      clearable: false,
      label: t('filter.date_range.label'),
      defaultValue: {
        start: dayjs().toISOString(),
        end: dayjs().toISOString(),
      },
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
      id: 'select-waste-characteristic',
      type: 'select-async-paginate',
      name: 'wasteCharacteristicsId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('filter.waste_characteristic.label'),
      placeholder: t('filter.waste_characteristic.placeholder'),
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
    {
      id: 'provinceMonitoring',
      type: 'select-async-paginate',
      name: 'provinceMonitoring',
      label: t('filter.province.label'),
      placeholder: t('filter.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: [
        'regencyMonitoring',
        'healthcareFacilityMonitoring',
      ],
      additional: { page: 1 },
      defaultValue: getDefaultProvinceValue(),
      disabled: ({ getValue }) =>
        !getValue('dateRange') || !!getDefaultProvinceValue(),
    },
    {
      id: 'regencyMonitoring',
      type: 'select-async-paginate',
      name: 'regencyMonitoring',
      label: t('filter.regency.label'),
      clearOnChangeFields: ['healthcareFacilityMonitoring'],

      placeholder: t('filter.regency.placeholder'),
      disabled: ({ getValue }) =>
        !getValue('provinceMonitoring') ||
        !getValue('dateRange') ||
        !!getDefaultRegencyValue() ||
        isProvinceManager(),
      loadOptions: loadRegencies,
      additional: ({ getReactSelectValue }) => ({
        parent_id: getReactSelectValue('provinceMonitoring'),
        page: 1,
      }),
      defaultValue: getDefaultRegencyValue(),
    },
    {
      id: 'healthcareFacilityMonitoring',
      type: 'select-async-paginate',
      name: 'healthcareFacilityMonitoring',
      label: t('filter.health_facilities.label'),
      placeholder: t('filter.health_facilities.placeholder'),
      loadOptions: loadEntityList,
      additional: ({ getReactSelectValue }) => ({
        page: 1,
        type_ids: '1,2,3,5',
        province_ids: getReactSelectValue('provinceMonitoring'),
        regency_ids: getReactSelectValue('regencyMonitoring'),
      }),
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
    {
      type: 'radio',
      name: 'isBags',
      label: t('filter.information_type.label'),
      options: informationTypeList(t),
      defaultValue: '0',
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
  ] satisfies UseFilter;
}
