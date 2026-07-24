import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getManufacture } from '@/services/manufacture';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterSchema } from '../schema/ManufactureSchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useManufactureTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'manufacture']);

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
    data: manufactureDataSource,
    isFetching: isManufactureFetchingData,
    refetch: refetchManufacture,
  } = useQuery({
    queryKey: ['manufacture', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, assetType, manufacturerId } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        assetType: getReactSelectValue(assetType),
        manufacturerId: getReactSelectValue(manufacturerId),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getManufacture(params);
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
    paramsFilter,
    manufactureDataSource,
    isLoading: isManufactureFetchingData,
    refetchManufacture,
  };
};
