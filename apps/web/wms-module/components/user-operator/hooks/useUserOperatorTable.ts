import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getOperatorThirdparty } from '@/services/partnership-operator';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterSchema } from '../schema/UserOperatorSchemaList';
import { useOperatorList } from './useOperatorList';

const paramsFilter = { page: 1, paginate: 50 };

export const useUserOperatorTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'userOperator']);

  const { options: operatorList } = useOperatorList();

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
        operatorList,
      }),
    [operatorList, t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: userOperatorDataSource,
    isFetching: isUserOperatorFetchingData,
    refetch: refecthUserOperator,
  } = useQuery({
    queryKey: ['user-operator', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { operator } = filter.query;
      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        ...(operator && {
          operatorId: getReactSelectValue(operator),
        }),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getOperatorThirdparty(params);
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
    userOperatorDataSource,
    isLoading: isUserOperatorFetchingData,
    refecthUserOperator,
  };
};
