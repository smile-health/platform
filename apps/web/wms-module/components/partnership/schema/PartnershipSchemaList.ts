import { loadEntityCompanyList } from '@/services/entity';
import { loadWasteSpecificationList } from '@/services/waste-specification';
import { isSuperAdmin } from '@/utils/getUserRole';
import { UseFilter } from '@repo/ui/components/filter';
import { OptionType } from '@repo/ui/components/react-select';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'partnership']>;
  thirdPartyPatnerOptions: OptionType[];
};

export const createFilterPartnershipGroupSchema = ({
  t,
  thirdPartyPatnerOptions,
}: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('partnership:list.filter.search.label'),
    placeholder: t('partnership:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-company-name',
    type: 'select',
    name: 'providerId',
    className: 'ui-w-full',
    label: t('partnership:list.filter.company_name.label'),
    placeholder: t('partnership:list.filter.company_name.placeholder'),
    options: thirdPartyPatnerOptions,
    isUsingReactQuery: false,
    defaultValue: null,
    hidden: isSuperAdmin(),
  },
  {
    id: 'select-company',
    type: 'select-async-paginate',
    name: 'companyId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('partnership:list.filter.company_name.label'),
    placeholder: t('partnership:list.filter.company_name.placeholder'),
    loadOptions: loadEntityCompanyList,
    additional: () => ({
      page: 1,
    }),
    defaultValue: null,
    hidden: !isSuperAdmin(),
  },
  {
    id: 'select-waste-characteristic',
    type: 'select-async-paginate',
    name: 'wasteClassificationId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('partnership:list.filter.waste_characteristic.label'),
    placeholder: t('partnership:list.filter.waste_characteristic.placeholder'),
    loadOptions: loadWasteSpecificationList,
    additional: () => ({
      page: 1,
    }),
    defaultValue: null,
  },
];
