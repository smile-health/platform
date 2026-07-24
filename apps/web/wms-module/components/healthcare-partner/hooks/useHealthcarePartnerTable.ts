import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getPartnership } from '@/services/partnership';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterHealthcarePartnerGroupSchema } from '../schema/HealthcarePartnerSchemaList';
import { useHealthcarePatner } from '@/components/partnership/hooks/useHealthcarePatner';
import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';

export const useHealthcarePartnerTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'healthcarePartner']);

  const { options: healthcarePatnerOptions } = useHealthcarePatner();

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
      createFilterHealthcarePartnerGroupSchema({
        t,
        healthcarePatnerOptions,
        partnershipStatusOptions: getPartnershipStatusOptions(),
      }),
    [t, healthcarePatnerOptions]
  );
  const filter = useFilter(filterSchema);

  const {
    data: partnershipDataSource,
    isFetching: isHealthcarePartnerFetchingData,
    refetch: refetchHealthcarePartner,
  } = useQuery({
    queryKey: [
      'healthcarePartner',
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { consumerId, partnershipStatus } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        consumerId: getReactSelectValue(consumerId),
        partnershipStatus: getReactSelectValue(partnershipStatus),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getPartnership(params);
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
    partnershipDataSource,
    isLoading: isHealthcarePartnerFetchingData,
    refetchHealthcarePartner,
  };
};
