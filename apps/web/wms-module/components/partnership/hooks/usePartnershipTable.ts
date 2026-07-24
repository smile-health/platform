import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getPartnership } from '@/services/partnership';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { createFilterPartnershipGroupSchema } from '../schema/PartnershipSchemaList';
import { useThirdPartyPatner } from './useThirdPartyPatner';
import { isSuperAdmin } from '@/utils/getUserRole';

export const usePartnershipTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'partnership']);

  const { options: thirdPartyPatnerOptions } = useThirdPartyPatner();

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
      createFilterPartnershipGroupSchema({
        t,
        thirdPartyPatnerOptions,
      }),
    [t, thirdPartyPatnerOptions]
  );

  const filter = useFilter(filterSchema);

  const {
    data: partnershipDataSource,
    isFetching: isPartnershipFetchingData,
    refetch: refetchPartnership,
  } = useQuery({
    queryKey: ['partnership', filter.query, pagination, language, sorting],
    queryFn: () => {
      const { search, providerId, companyId, wasteClassificationId } =
        filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        search: search,
        providerId: isSuperAdmin()
          ? getReactSelectValue(companyId)
          : getReactSelectValue(providerId),
        wasteClassificationId: getReactSelectValue(wasteClassificationId),
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
    isLoading: isPartnershipFetchingData,
    refetchPartnership,
  };
};
