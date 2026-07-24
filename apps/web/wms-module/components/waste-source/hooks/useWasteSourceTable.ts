import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getWasteSource } from '@/services/waste-source';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterWasteSourceGroupSchema } from '../schema/WasteSourceSchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useWasteSourceTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'wasteSource']);

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
      createFilterWasteSourceGroupSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: wasteSourceDataSource,
    isFetching: isWasteSourceFetchingData,
    refetch: refetchWasteSource,
  } = useQuery({
    queryKey: ['wasteSource', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, sourceType } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        sourceType: getReactSelectValue(sourceType),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getWasteSource(params);
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
    wasteSourceDataSource,
    isLoading: isWasteSourceFetchingData,
    refetchWasteSource,
  };
};
