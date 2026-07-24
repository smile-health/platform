import { UseFilter } from '@repo/ui/components/filter';
import { OptionType } from '@repo/ui/components/react-select';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'userOperator']>;
  operatorList: OptionType[];
};

export const createFilterSchema = ({ t, operatorList }: Params): UseFilter => [
  {
    id: 'select-operator',
    type: 'select',
    name: 'operator',
    className: 'ui-w-full',
    isMulti: false,
    label: t('userOperator:form.operator.label'),
    placeholder: t('userOperator:form.operator.placeholder'),
    options: operatorList,
    isUsingReactQuery: false,
    defaultValue: null,
  },
];
