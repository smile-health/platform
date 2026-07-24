import { getAssetTypeOptions } from '@/components/healthcare/utils/helper';
import { loadManufacturers } from '@/services/manufacture';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';
export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'manufacture']>;
};

export const createFilterSchema = ({ t }: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('manufacture:list.filter.search.label'),
    placeholder: t('manufacture:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-asset-type',
    type: 'select',
    name: 'assetType',
    isMulti: false,
    label: t('manufacture:form.asset_type.label'),
    placeholder: t('manufacture:form.asset_type.placeholder'),
    options: getAssetTypeOptions(t),
    defaultValue: null,
    isUsingReactQuery: false,
    className: 'ui-w-full',
  },
  {
    id: 'select-manufacturer',
    type: 'select-async-paginate',
    name: 'manufacturerId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('manufacture:form.manufacture.label'),
    placeholder: t('manufacture:form.manufacture.placeholder'),
    loadOptions: loadManufacturers,
    additional: { page: 1 },
    defaultValue: null,
  },
];
