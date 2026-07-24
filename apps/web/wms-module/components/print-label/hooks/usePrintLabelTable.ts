import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getPrintLabel } from '@/services/print-label';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterPrintLabelGroupSchema } from '../schema/PrintLabelSchemaList';

export const usePrintLabelTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'printLabel']);

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
      createFilterPrintLabelGroupSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: printLabelDataSource,
    isFetching: isPrintLabelFetchingData,
    refetch: refetchPrintLabel,
  } = useQuery({
    queryKey: ['printLabel', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, sourceType } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        sourceType: getReactSelectValue(sourceType),
        search: search,
        ...(sorting.length !== 0 && {
          sortBy: sorting?.[0]?.id,
          sortOrder: sorting?.[0]?.desc ? 'DESC' : 'ASC',
        }),
      };
      return getPrintLabel(params);
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
    printLabelDataSource,
    isLoading: isPrintLabelFetchingData,
    refetchPrintLabel,
  };
};
