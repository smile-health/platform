import { getSourceTypeOptions } from '@/components/waste-source/utils/helper';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'printLabel']>;
};

export const createFilterPrintLabelGroupSchema = ({ t }: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('printLabel:list.filter.search.label'),
    placeholder: t('printLabel:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-source-type',
    type: 'select',
    name: 'sourceType',
    isMulti: false,
    label: t('printLabel:list.filter.source_type.label'),
    placeholder: t('printLabel:list.filter.source_type.placeholder'),
    options: getSourceTypeOptions(),
    defaultValue: null,
    isUsingReactQuery: false,
    className: 'ui-w-full',
  },
];
