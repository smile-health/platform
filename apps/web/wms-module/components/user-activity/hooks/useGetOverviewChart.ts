import { useQuery } from '@tanstack/react-query';
import { Values } from 'nuqs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getOverview } from '@/services/user-activity';
import { getLabelOptions, handleFilter } from '../utils/helper';

export default function useGetOverviewChart(
  filter: Values<Record<string, any>>
) {
  const { t } = useTranslation('userActivity');
  const [enabled, setEnabled] = useState(false);

  const params = handleFilter(filter);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['overview-activity', params],
    queryFn: () => getOverview(params),
    staleTime: 0,
    gcTime: 0,
  });

  const activeLabel = filter.typeOfProcessing?.value
    ? t('title.type_processing.internal')
    : t('title.type.active');
  const inactiveLabel = filter.typeOfProcessing?.value
    ? t('title.type_processing.external')
    : t('title.type.inactive');
  const { totalEntities, inactiveEntities, activeEntities } = data?.data ?? {};

  const loading = isLoading || isFetching;

  const getChart = () => {
    if (!enabled) setEnabled(true);
  };

  const monthName = filter.periode?.start
    ? new Date(filter.periode.start).toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleString('id-ID', {
        month: 'long',
        year: 'numeric',
      });

  return {
    month: monthName,
    activity: {
      name: '',
    },
    data: [
      {
        value: activeEntities ?? 0,
        name: activeLabel,
        labelLine: {
          length: 30,
        },
        label: getLabelOptions(true),
      },
      {
        value: inactiveEntities ?? 0,
        name: inactiveLabel,
        labelLine: {
          length: 30,
        },
        label: getLabelOptions(),
      },
    ],
    total: totalEntities ?? 0,
    legendMaps: {
      [activeLabel]: `${activeEntities} ${activeLabel}`,
      [inactiveLabel]: `${inactiveEntities} ${inactiveLabel}`,
    },
    isEmpty: !data?.data && !loading,
    isLoading: loading,
    getChart: () => setTimeout(getChart, 300),
  };
}
