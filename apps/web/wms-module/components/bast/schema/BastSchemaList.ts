import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'bast']>;
  isGlobal?: boolean;
  isProgramKFAEnabled?: boolean;
};

export const createFilterBastGroupSchema = ({ t }: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('bast:list.filter.handover_document.search.label'),
    placeholder: t('bast:list.filter.handover_document.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
];
