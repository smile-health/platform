import { loadWasteByParentHierarchyId } from '@/services/waste-hierarchy';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'wasteSpecification']>;
};

export const createFilterWasteSpecificationSchema = ({
  t,
}: Params): UseFilter => [
  {
    id: 'select-waste-type',
    type: 'select-async-paginate',
    name: 'waste_type_id',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteSpecification:form.waste_type.label'),
    placeholder: t('wasteSpecification:form.waste_type.placeholder'),
    loadOptions: loadWasteByParentHierarchyId,
    clearOnChangeFields: ['waste_group_id'],
    additional: { page: 1, parent_hierarchy_id: null },
    defaultValue: null,
  },
  {
    id: 'select-waste-group',
    type: 'select-async-paginate',
    name: 'waste_group_id',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteSpecification:form.waste_group.label'),
    placeholder: t('wasteSpecification:form.waste_group.placeholder'),
    loadOptions: loadWasteByParentHierarchyId,
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('waste_type_id') && {
        parent_hierarchy_id: getReactSelectValue('waste_type_id'),
      }),
    }),
    clearOnChangeFields: ['waste_characteristic_id'],
    disabled: ({ getReactSelectValue }) =>
      !getReactSelectValue('waste_type_id'),
    defaultValue: null,
  },
  {
    id: 'select-waste-characteristic',
    type: 'select-async-paginate',
    name: 'waste_characteristic_id',
    className: 'ui-w-full',
    isMulti: false,
    label: t('wasteSpecification:form.waste_characteristic.label'),
    placeholder: t('wasteSpecification:form.waste_characteristic.placeholder'),
    loadOptions: loadWasteByParentHierarchyId,
    additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
      page: 1,
      ...(getReactSelectValue('waste_group_id') && {
        parent_hierarchy_id: getReactSelectValue('waste_group_id'),
      }),
    }),
    disabled: ({ getReactSelectValue }) =>
      !getReactSelectValue('waste_group_id'),
    defaultValue: null,
  },
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('wasteSpecification:list.filter.search.label'),
    placeholder: t('wasteSpecification:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
];
