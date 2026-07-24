import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { createFilterAssetDongleSchema } from '../schema/AssetDongleSchemaList';
import { getEntityWmsList } from '@/services/entity';
import { getReactSelectValue } from '@repo/ui/utils/react-select';

export const useAssetDongleTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetDongle']);
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  );
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const filterSchema = useMemo<UseFilter>(
    () =>
      createFilterAssetDongleSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: assetDongleDataSource,
    isFetching: isAssetDongleFetchingData,
    refetch: refetchAssetDongle,
  } = useQuery({
    queryKey: ['asset-dongle', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, provinceId, regencyId, entityTypeId } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search,
        entityTypeId: getReactSelectValue(entityTypeId),
        provinceId: getReactSelectValue(provinceId),
        regencyId: getReactSelectValue(regencyId),
      };
      return getEntityWmsList(params);
    },
    placeholderData: keepPreviousData,
  });

  const handleChangePage = (page: number) => setPagination({ page });

  const handleChangePaginate = (paginate: number) => {
    setPagination({ page: 1, paginate });
  };

  return {
    filter,
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    sorting,
    setSorting,
    assetDongleDataSource,
    isLoading: isAssetDongleFetchingData,
    refetchAssetDongle,
  };
};
