import { UseFilter } from '@repo/ui/components/filter';
import { OptionType } from '@repo/ui/components/react-select';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'healthcarePartner']>;
  healthcarePatnerOptions: OptionType[];
  partnershipStatusOptions: OptionType[];
};

export const createFilterHealthcarePartnerGroupSchema = ({
  t,
  healthcarePatnerOptions,
  partnershipStatusOptions,
}: Params): UseFilter => [
  {
    id: 'select-partnership-status',
    type: 'select',
    name: 'partnershipStatus',
    className: 'ui-w-full',
    isMulti: false,
    label: t('healthcarePartner:list.filter.partnership_status.label'),
    placeholder: t(
      'healthcarePartner:list.filter.partnership_status.placeholder'
    ),
    options: partnershipStatusOptions,
    isUsingReactQuery: false,
    defaultValue: null,
  },
  {
    id: 'select-healthcare-partner',
    type: 'select',
    name: 'consumerId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('healthcarePartner:list.filter.healthcare_partner.label'),
    placeholder: t(
      'healthcarePartner:list.filter.healthcare_partner.placeholder'
    ),
    options: healthcarePatnerOptions,
    isUsingReactQuery: false,
    defaultValue: null,
  },
];
