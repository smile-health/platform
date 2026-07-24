import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getTreatmentLocation } from '@/services/entity-location';
import { ROLE_LABEL } from '@/types/roles';
import { getUserRoleString } from '@/utils/getUserRole';
import { createFilterSchema } from '../schema/TreatmentLocationSchemaList';

const paramsFilter = { page: 1, paginate: 50 };

export const useTreatmentLocationTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'treatmentLocation']);
  const role = getUserRoleString();

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
    data: treatmentLocationDataSource,
    isFetching: isTreatmentLocationLoading,
    refetch: refetchTreatmentLocation,
  } = useQuery({
    queryKey: [
      'treatmentLocation',
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { search } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        ...(role === ROLE_LABEL.SUPER_ADMIN && {
          locationType: 'TREATMENT',
        }),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getTreatmentLocation(params);
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
    treatmentLocationDataSource,
    isLoading: isTreatmentLocationLoading,
    refetchTreatmentLocation,
  };
};
