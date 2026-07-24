import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import { loadStatusAsset } from '@repo/ui/services/status-asset';

import * as yup from 'yup';
import { ASSET_INVENTORY_STATUS } from '@/types/healthcare-asset';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'healthcareAsset']>;
};

export const createFilterHealthcareAssetGroupSchema = ({
  t,
}: Params): UseFilter => {
  const filters: UseFilter = [
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('healthcareAsset:list.filter.search.label'),
      placeholder: t('healthcareAsset:list.filter.search.placeholder'),
      className: 'ui-w-full',
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'asset_working_status',
      type: 'select-async-paginate',
      name: 'workingStatusId',
      isMulti: false,
      label: t('healthcareAsset:list.filter.working_status.label'),
      placeholder: t('healthcareAsset:list.filter.working_status.placeholder'),
      className: 'ui-w-full',
      defaultValue: null,
      loadOptions: loadStatusAsset,
      additional: { page: 1 },
    },
    {
      id: 'asset__inventory__status',
      type: 'select',
      name: 'status',
      isMulti: false,
      label: t('healthcareAsset:list.filter.status.label'),
      placeholder: t('healthcareAsset:list.filter.status.placeholder'),
      className: 'ui-w-full',
      defaultValue: null,
      options: [
        {
          value: ASSET_INVENTORY_STATUS.INACTIVE,
          label: t('common:status.inactive'),
        },
        {
          value: ASSET_INVENTORY_STATUS.ACTIVE,
          label: t('common:status.active'),
        },
      ],
    },
  ];

  return filters;
};
