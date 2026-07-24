import { loadEntityList } from '@/services/entity';
import { loadManufacturers } from '@/services/manufacture';
import { ROLE_LABEL } from '@/types/roles';
import { getDefaultHealthcareFacilityValue } from '@/utils/getUserRole';
import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import * as yup from 'yup';
import { getAssetTypeOptions } from '../utils/helper';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'healthCare']>;
  userRole: ROLE_LABEL | null;
};

export const createFilterHealthcareGroupSchema = ({
  t,
  userRole,
}: Params): UseFilter => {
  const filters: UseFilter = [
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('healthCare:list.filter.search.label'),
      placeholder: t('healthCare:list.filter.search.placeholder'),
      className: 'ui-w-full',
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'select-asset-type',
      type: 'select',
      name: 'assetType',
      isMulti: false,
      label: t('healthCare:form.asset_type.label'),
      placeholder: t('healthCare:form.asset_type.placeholder'),
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
      label: t('healthCare:form.manufacture.label'),
      placeholder: t('healthCare:form.manufacture.placeholder'),
      loadOptions: loadManufacturers,
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-healthcare',
      type: 'select-async-paginate',
      name: 'healthcareFacilityId',
      className: 'ui-w-full',
      isMulti: false,
      label: t('healthCare:form.healthcare_facility.label'),
      placeholder: t('healthCare:form.healthcare_facility.placeholder'),
      loadOptions: loadEntityList,
      additional: {
        page: 1,
        type_ids: '3',
      },
      defaultValue: getDefaultHealthcareFacilityValue(),
      disabled: !!getDefaultHealthcareFacilityValue(),
    },
  ];

  return filters;
};
