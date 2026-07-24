import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import {
  getWasteGroupTransporterTP,
  getWasteGroupTreatmentTP,
} from '@/services/homepage';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { ProviderTypeTP } from '../constants/constant.home';
import { createFilterHomeTPGroupSchema } from '../schema/HomeTPSchemaList';

export const useHomeTPTable = (activeTab: string) => {
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
      createFilterHomeTPGroupSchema({
        t,
      }),
    [t]
  );
  const filter = useFilter(filterSchema);

  const {
    data: wasteGroupDataSource,
    isFetching: isWasteGroupFetchingData,
    refetch: refetchWasteGroup,
  } = useQuery({
    queryKey: [
      'wasteGroup',
      activeTab,
      filter.query,
      pagination,
      language,
      sorting,
    ],
    queryFn: () => {
      const { dateRange, healthcareFacilityId, provinceId, cityId, search } =
        filter.query;

      const params = {
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        startDate: dateRange?.start || '-',
        endDate: dateRange?.end || '-',
        search: search,
        healthcareFacilityId: getReactSelectValue(healthcareFacilityId),
        provinceId: getReactSelectValue(provinceId),
        cityId: getReactSelectValue(cityId),
        ...(activeTab !== ProviderTypeTP.TRANSPORTER && {
          disposalTreatment: activeTab,
        }),
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };

      if (activeTab === ProviderTypeTP.TRANSPORTER) {
        return getWasteGroupTransporterTP(params);
      }
      return getWasteGroupTreatmentTP(params);
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
    wasteGroupDataSource,
    isLoading: isWasteGroupFetchingData,
    refetchWasteGroup,
  };
};
