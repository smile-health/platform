import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getAssetType } from '@/services/asset-type';
import { createFilterSchema } from '../schema/AssetTypeSchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useAssetTypeTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetType']);

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
      createFilterSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: assetTypeDataSource,
    isFetching: isAssetTypeFetchingData,
    refetch: refetchAssetType,
  } = useQuery({
    queryKey: ['asset-type', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getAssetType(params);
    },
    placeholderData: keepPreviousData,
    enabled: false,
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
    paramsFilter,
    assetTypeDataSource,
    isLoading: isAssetTypeFetchingData,
    refetchAssetType,
  };
};
