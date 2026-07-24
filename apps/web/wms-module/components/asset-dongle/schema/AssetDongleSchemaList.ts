import { UseFilter } from '@repo/ui/components/filter';
import { TFunction } from 'i18next';
import { loadProvinces, loadRegencies } from '@repo/ui/services/location';
import { getGlobalEntityType } from '@repo/ui/services/entity';
import * as yup from 'yup';

export const filterSchema = yup.object({
  keyword: yup.string().notRequired(),
});

type Params = {
  t: TFunction<['common', 'assetDongle']>;
};

export const createFilterAssetDongleSchema = ({ t }: Params): UseFilter => {
  const filters: UseFilter = [
    {
      type: 'text',
      name: 'search',
      id: 'input-search',
      label: t('assetDongle:list.filter.search.label'),
      placeholder: t('assetDongle:list.filter.search.placeholder'),
      className: 'ui-w-full',
      defaultValue: '',
      maxLength: 255,
    },
    {
      id: 'select-province',
      type: 'select-async-paginate',
      name: 'provinceId',
      isMulti: false,
      label: t('common:form.province.label'),
      placeholder: t('common:form.province.placeholder'),
      loadOptions: loadProvinces,
      clearOnChangeFields: ['regencyId', 'sub_district_ids'],
      additional: { page: 1 },
      defaultValue: null,
    },
    {
      id: 'select-regency',
      type: 'select-async-paginate',
      name: 'regencyId',
      isMulti: false,
      label: t('common:form.city.label'),
      placeholder: t('common:form.city.placeholder'),
      loadOptions: loadRegencies,
      disabled: ({ getReactSelectValue }) => !getReactSelectValue('provinceId'),
      clearOnChangeFields: ['sub_district_ids'],
      additional: ({ getReactSelectValue }: { getReactSelectValue: any }) => ({
        page: 1,
        ...(getReactSelectValue('provinceId') && {
          parent_id: getReactSelectValue('provinceId'),
        }),
      }),
      defaultValue: null,
    },
    {
      id: 'select-type',
      type: 'select',
      name: 'entityTypeId',
      isMulti: false,
      label: t('assetDongle:list.filter.type.label'),
      placeholder: t('assetDongle:list.filter.type.placeholder'),
      className: '',
      defaultValue: null,
      loadOptions: async () => {
        let result = await getGlobalEntityType({ page: 1, paginate: 100 });

        return result.data.map((x) => ({ value: x.id, label: x.name })) || [];
      },
    },
  ];

  return filters;
};
