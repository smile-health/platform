import { UseFilter } from '@repo/ui/components/filter';
import { OptionType } from '@repo/ui/components/react-select';
import { TFunction } from 'i18next';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'partnershipVehicle']>;
  healthcarePatnerOptions: OptionType[];
};

export const createFilterPartnershipVehicleGroupSchema = ({
  t,
  healthcarePatnerOptions,
}: Params): UseFilter => [
  {
    type: 'text',
    name: 'search',
    id: 'input-search',
    label: t('partnershipVehicle:list.filter.search.label'),
    placeholder: t('partnershipVehicle:list.filter.search.placeholder'),
    className: 'ui-w-full',
    defaultValue: '',
    maxLength: 255,
  },
  {
    id: 'select-healthcare-patner',
    type: 'select',
    name: 'healthcareFacilityId',
    className: 'ui-w-full',
    isMulti: false,
    label: t('partnershipVehicle:list.filter.healthcare_partner.label'),
    placeholder: t(
      'partnershipVehicle:list.filter.healthcare_partner.placeholder'
    ),
    options: healthcarePatnerOptions,
    isUsingReactQuery: false,
    defaultValue: null,
  },
];
