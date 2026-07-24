import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getEntityUsersList } from '@/services/entity';
import { createFilterSchemaUsersList } from '../schema/EntitySchemaList';
import { useParams } from 'next/navigation';

const paramsFilter = { page: 1, paginate: 50 };

export const useEntityDetailUsers = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'entityWMS']);

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
      createFilterSchemaUsersList({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const urlParams = useParams();
  const id = urlParams?.id;

  const {
    data: entityDetailUsersDataSource,
    isFetching: isEntityFetchingData,
  } = useQuery({
    queryKey: [
      'entityDetailUsers',
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { keyword } = filter.query;

      const params = {
        page: pagination.page || 1,
        paginate: pagination.paginate || 10,
        entity_id: id,
        keyword: keyword,
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getEntityUsersList(params);
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
    entityDetailUsersDataSource,
    isLoading: isEntityFetchingData,
  };
};
