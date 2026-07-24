import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getHealthcare } from '@/services/healthcare';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterHealthcareGroupSchema } from '../schema/HealthcareSchemaList';

export const useHealthcareTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'healthCare']);

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
      createFilterHealthcareGroupSchema({
        t,
        userRole: null,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: healthcareDataSource,
    isFetching: isHealthcareFetchingData,
    refetch: refetchHealthcare,
  } = useQuery({
    queryKey: ['healthcare', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, assetType, manufacturerId, healthcareFacilityId } =
        filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        healthcareFacilityId: getReactSelectValue(healthcareFacilityId),
        assetType: getReactSelectValue(assetType),
        manufacturerId: getReactSelectValue(manufacturerId),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getHealthcare(params);
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
    healthcareDataSource,
    isLoading: isHealthcareFetchingData,
    refetchHealthcare,
  };
};
