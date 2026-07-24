import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getPartnership } from '@/services/partnership';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterThirdPartyPartnerGroupSchema } from '../schema/ThirdPartyPartnerSchemaList';
import { useThirdPartyPatner } from '@/components/partnership/hooks/useThirdPartyPatner';
import { useHealthcarePatner } from '@/components/partnership/hooks/useHealthcarePatner';

export const useThirdPartyPartnerTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'thirdPartyPartner']);

  const { options: thirdPartyPatnerOptions } = useThirdPartyPatner();
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
      createFilterThirdPartyPartnerGroupSchema({
        t,
        thirdPartyPatnerOptions,
        healthcarePatnerOptions,
      }),
    [t, thirdPartyPatnerOptions, healthcarePatnerOptions]
  );
  const filter = useFilter(filterSchema);

  const {
    data: partnershipDataSource,
    isFetching: isThirdPartyPartnerFetchingData,
    refetch: refetchThirdPartyPartner,
  } = useQuery({
    queryKey: [
      'thirdPartyPartner',
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { search, providerId, consumerId } = filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        providerId: getReactSelectValue(providerId),
        consumerId: getReactSelectValue(consumerId),
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
    isLoading: isThirdPartyPartnerFetchingData,
    refetchThirdPartyPartner,
  };
};
