import { UseFilter } from '@repo/ui/components/filter';
import { OptionType } from '@repo/ui/components/react-select';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'thirdPartyPartner']>;
  thirdPartyPatnerOptions: OptionType[];
  healthcarePatnerOptions: OptionType[];
};

export const createFilterThirdPartyPartnerGroupSchema = ({
  t,
  thirdPartyPatnerOptions,
  healthcarePatnerOptions,
}: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('thirdPartyPartner:list.filter.search.label'),
    placeholder: t('thirdPartyPartner:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-third-party-patner',
    type: 'select',
    name: 'providerId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('thirdPartyPartner:list.filter.third_party_patner.label'),
    placeholder: t(
      'thirdPartyPartner:list.filter.third_party_patner.placeholder'
    ),
    options: thirdPartyPatnerOptions,
    isUsingReactQuery: false,
    defaultValue: null,
  },
  {
    id: 'select-healthcare-patner',
    type: 'select',
    name: 'consumerId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('thirdPartyPartner:list.filter.healthcare_partner.label'),
    placeholder: t(
      'thirdPartyPartner:list.filter.healthcare_partner.placeholder'
    ),
    options: healthcarePatnerOptions,
    isUsingReactQuery: false,
    defaultValue: null,
  },
];
