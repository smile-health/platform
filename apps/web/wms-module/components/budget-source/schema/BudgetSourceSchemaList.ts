import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'budgetSource']>;
};

export const createFilterSchema = ({ t }: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('budgetSource:list.filter.search.label'),
    placeholder: t('budgetSource:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
];
