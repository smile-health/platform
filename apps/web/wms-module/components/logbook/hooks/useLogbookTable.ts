import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getLogbook } from '@/services/logbook';
import { getUserStorage } from '@/utils/storage/user';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterLogbookGroupSchema } from '../schema/LogbookSchemaList';

export const useLogbookTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'logbook']);
  const user = getUserStorage();

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
      createFilterLogbookGroupSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: logbookDataSource,
    isFetching: isLogbookFetchingData,
    refetch: refetchLogbook,
  } = useQuery({
    queryKey: ['logbook', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { dateRange, search, provinceId, cityId, healthcareId } =
        filter.query;
      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        startDate: dateRange?.start || '-',
        endDate: dateRange?.end || '-',
        provinceId: getReactSelectValue(provinceId),
        cityId: getReactSelectValue(cityId),
        healthcareId: getReactSelectValue(healthcareId),
        search: search,
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getLogbook(params);
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
    logbookDataSource,
    isLoading: isLogbookFetchingData,
    refetchLogbook,
  };
};
