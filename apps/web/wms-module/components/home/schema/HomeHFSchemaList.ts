import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'home']>;
};

export const createFilterHomeHFGroupSchema = ({ t }: Params): UseFilter => {
  const filters: UseFilter = [
    {
      id: 'select-waste-type',
      type: 'select-async-paginate',
      name: 'wasteTypeId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('home:home_hf.filter.waste_type.label'),
      placeholder: t('home:home_hf.filter.waste_type.placeholder'),
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
      label: t('home:home_hf.filter.waste_group.label'),
      placeholder: t('home:home_hf.filter.waste_group.placeholder'),
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
      label: t('home:home_hf.filter.waste_characteristic.label'),
      placeholder: t('home:home_hf.filter.waste_characteristic.placeholder'),
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
    // {
    // 	id: 'select-waste-status',
    // 	type: 'select',
    // 	name: 'wasteStatus',
    // 	className: 'ui-w-full',
    // 	isMulti: false,
    // 	label: t('home:home_hf.filter.waste_status.label'),
    // 	placeholder: t('home:home_hf.filter.waste_status.placeholder'),
    // 	options: [],
    // 	isUsingReactQuery: false,
    // 	defaultValue: null,
    // },
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('home:home_hf.filter.search.label'),
      placeholder: t('home:home_hf.filter.search.placeholder'),
      className: 'ui-w-full',
      defaultValue: '',
      maxLength: 255,
    },
  ];

  return filters;
};
