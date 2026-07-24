import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getWasteGroupHF } from '@/services/homepage';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterHomeHFGroupSchema } from '../schema/HomeHFSchemaList';

export const useHomeHFTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'home']);

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
      createFilterHomeHFGroupSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: transactionDataSource,
    isFetching: isTransactionFetchingData,
    refetch: refetchTransaction,
  } = useQuery({
    queryKey: ['transaction', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, wasteTypeId, wasteGroupId, wasteCharacteristicsId } =
        filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        ...(search && { search }),
        wasteTypeId: getReactSelectValue(wasteTypeId),
        wasteGroupId: getReactSelectValue(wasteGroupId),
        wasteCharacteristicsId: getReactSelectValue(wasteCharacteristicsId),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getWasteGroupHF(params);
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
    transactionDataSource,
    isLoading: isTransactionFetchingData,
    refetchTransaction,
  };
};
