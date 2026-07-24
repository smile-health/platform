import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';
import { getSourceTypeOptions } from '../utils/helper';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'wasteSource']>;
  isGlobal?: boolean;
  isProgramKFAEnabled?: boolean;
};

export const createFilterWasteSourceGroupSchema = ({
  t,
}: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('wasteSource:list.filter.waste_source.search.label'),
    placeholder: t('wasteSource:list.filter.waste_source.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-source-type',
    type: 'select',
    name: 'sourceType',
    isMulti: false,
    label: t('wasteSource:list.filter.waste_source.source_type.label'),
    placeholder: t(
      'wasteSource:list.filter.waste_source.source_type.placeholder'
    ),
    options: getSourceTypeOptions(),
    defaultValue: null,
    isUsingReactQuery: false,
    className: 'ui-w-full',
  },
];
