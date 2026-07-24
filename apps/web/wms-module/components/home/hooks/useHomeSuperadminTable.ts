import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDetailWasteTransaction,
  getSummaryWasteHierarchy,
} from '@/services/homepage';
import {
  getDefaultProvinceValue,
  getDefaultRegencyValue,
} from '@/utils/getUserRole';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { createFilterSchema } from '../schema/HomeSuperadminSchemaList';

type HomeSuperadminParams = {
  healthcareFacilityId?: number;
};

export const useHomeSuperadminTable = ({
  healthcareFacilityId,
}: HomeSuperadminParams = {}) => {
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

  const filterSchema = useMemo<UseFilter>(() => {
    return createFilterSchema({
      t,
    });
  }, [t]);

  const filter = useFilter(filterSchema);

  const {
    data: summaryWasteHierarchy,
    isFetching: isSummaryWasteHierarchyFetching,
    refetch: refetchWasteHierarchy,
  } = useQuery({
    queryKey: ['summaryWasteHierarchy', filter.query, pagination, language],
    queryFn: () => {
      const { provinceId, regencyId, dateRange } = filter.query;

      return getSummaryWasteHierarchy({
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        provinceId:
          getReactSelectValue(provinceId) || getDefaultProvinceValue()?.value,
        cityId:
          getReactSelectValue(regencyId) || getDefaultRegencyValue()?.value,
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
    },
    placeholderData: keepPreviousData,
  });

  const {
    data: detailTransactionWaste,
    isFetching: isDetailTransactionFetching,
    refetch: refetchDetailTransaction,
  } = useQuery({
    queryKey: ['detailTransaction', filter.query, pagination, language],
    queryFn: () => {
      const { wasteTypeId, dateRange } = filter.query;

      return getDetailWasteTransaction({
        page: pagination.page || 1,
        limit: pagination.paginate || 10,
        wasteTypeId: getReactSelectValue(wasteTypeId),
        healthcareFacilityId: Number(healthcareFacilityId),
        startDate: dateRange?.start,
        endDate: dateRange?.end,
      });
    },
    placeholderData: keepPreviousData,
    enabled: !!healthcareFacilityId,
  });

  const handleChangePage = (page: number) => setPagination({ page });

  const handleChangePaginate = (paginate: number) => {
    setPagination({ page: 1, paginate });
  };

  return {
    handleChangePage,
    handleChangePaginate,
    refetchWasteHierarchy,
    refetchDetailTransaction,
    setPagination,
    filter,
    summaryWasteHierarchy,
    isSummaryWasteHierarchyFetching,
    pagination,
    detailTransactionWaste,
    isDetailTransactionFetching,
  };
};
