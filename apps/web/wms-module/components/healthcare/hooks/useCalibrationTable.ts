import { parseAsInteger, useQueryStates } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ColumnSort } from '@tanstack/react-table';

import { getHFAssetActivity } from '@/services/hf-asset-activity';
import { ActivityType } from '@/types/hf-asset-activity';

export const useCalibrationTable = () => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'healthCare']);
  const params = useParams();
  const id = params?.id as string;

  const [pagination, setPagination] = useQueryStates(
    {
      pageCalibration: parseAsInteger.withDefault(1),
      paginateCalibration: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  );
  const [sorting, setSorting] = useState<ColumnSort[]>([]);

  const {
    data: calibrationDataSource,
    isFetching: isCalibrationFetchingData,
    refetch: refetchCalibration,
  } = useQuery({
    queryKey: ['hf-asset-activity-calibration', pagination, language, sorting],
    queryFn: () => {
      const params = {
        page: pagination.pageCalibration,
        limit: pagination.paginateCalibration,
        hfAssetId: id,
        activityType: ActivityType.CALIBRATION,
        ...(sorting.length !== 0 && {
          sort_by: sorting?.[0]?.id,
          sort_type: sorting?.[0]?.desc ? 'desc' : 'asc',
        }),
      };
      return getHFAssetActivity(params);
    },
    placeholderData: keepPreviousData,
  });

  const handleChangePage = (pageCalibration: number) =>
    setPagination({ pageCalibration });

  const handleChangePaginate = (paginateCalibration: number) => {
    setPagination({ pageCalibration: 1, paginateCalibration });
  };

  return {
    handleChangePage,
    handleChangePaginate,
    setPagination,
    pagination,
    sorting,
    setSorting,
    calibrationDataSource,
    isLoading: isCalibrationFetchingData,
    refetchCalibration,
  };
};
