import { parseAsInteger, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getHFAssetActivity } from '@/services/hf-asset-activity';
import { ActivityType } from '@/types/hf-asset-activity';

export const useMaintenanceTable = () => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'healthCare']);
  const params = useParams();
  const id = params?.id as string;

  const [pagination, setPagination] = useQueryStates(
    {
      pageMaintenance: parseAsInteger.withDefault(1),
      paginateMaintenance: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  );
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const {
    data: maintenanceDataSource,
    isFetching: isMaintenanceFetchingData,
    refetch: refetchMaintenance,
  } = useQuery({
    queryKey: ['hf-asset-activity-maintenance', pagination, language, sorting],
    queryFn: () => {
      const params = {
        page: pagination.pageMaintenance,
        limit: pagination.paginateMaintenance,
        hfAssetId: id,
        activityType: ActivityType.MAINTENANCE,
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getHFAssetActivity(params);
    },
    placeholderData: keepPreviousData,
  });

  const handleChangePage = (pageMaintenance: number) =>
    setPagination({ pageMaintenance });

  const handleChangePaginate = (paginateMaintenance: number) => {
    setPagination({ pageMaintenance: 1, paginateMaintenance });
  };

  return {
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    sorting,
    setSorting,
    maintenanceDataSource,
    isLoading: isMaintenanceFetchingData,
    refetchMaintenance,
  };
};
