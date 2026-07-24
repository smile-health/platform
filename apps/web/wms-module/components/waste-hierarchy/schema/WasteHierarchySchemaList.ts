import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';
import { getStatusCharacteristicOptions } from '../utils/helper';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'wasteHierarchy']>;
  tab: string;
};

export const createFilterWasteTypeSchema = ({ t, tab }: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label:
      tab === 'waste_type'
        ? t('wasteHierarchy:list.filter.waste_type.search.label')
        : tab === 'waste_group'
          ? t('wasteHierarchy:list.filter.waste_group.search.label')
          : t('wasteHierarchy:list.filter.waste_characteristic.search.label'),
    placeholder:
      tab === 'waste_type'
        ? t('wasteHierarchy:list.filter.waste_type.search.placeholder')
        : tab === 'waste_group'
          ? t('wasteHierarchy:list.filter.waste_group.search.placeholder')
          : t(
              'wasteHierarchy:list.filter.waste_characteristic.search.placeholder'
            ),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-waste-type',
    type: 'select-async-paginate',
    name: 'wasteTypeId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteHierarchy:list.filter.waste_type.waste_type.label'),
    placeholder: t(
      'wasteHierarchy:list.filter.waste_type.waste_type.placeholder'
    ),
    loadOptions: loadWasteByParentHierarchyId,
    additional: { page: 1 },
    defaultValue: null,
    hidden: tab !== 'waste_characteristic',
  },
  {
    id: 'select-waste-group',
    type: 'select-async-paginate',
    name: 'wasteGroupId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteHierarchy:list.filter.waste_group.waste_group.label'),
    placeholder: t(
      'wasteHierarchy:list.filter.waste_group.waste_group.placeholder'
    ),
    loadOptions: loadWasteByParentHierarchyId,
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('wasteTypeId') && {
        parent_hierarchy_id: getReactSelectValue('wasteTypeId'),
      }),
    }),
    disabled: ({ getReactSelectValue }) => !getReactSelectValue('wasteTypeId'),
    defaultValue: null,
    hidden: tab !== 'waste_characteristic',
  },
  {
    id: 'select-status',
    type: 'select',
    name: 'isActive',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteHierarchy:list.filter.is_active.label'),
    placeholder: t('wasteHierarchy:list.filter.is_active.placeholder'),
    options: getStatusCharacteristicOptions(),
    isUsingReactQuery: false,
    defaultValue: null,
    hidden: tab !== 'waste_characteristic',
  },
];
