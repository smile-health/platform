import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OptionType } from '@repo/ui/components/react-select';
import { Values } from 'nuqs';

import { dataMapping, handleFilter } from '../utils/helper';
import { getChartWasteCharacteristicsSummary } from '@/services/transaction-monitoring';
import i18n from '@/locales/i18n';

export default function useGetWasteBagCharacteristicChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null
) {
  const params = handleFilter(filter);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['waste-bag-characteristic-chart', params, i18n.language],
    queryFn: () => getChartWasteCharacteristicsSummary(params),
  });

  const wasteBagCharacteristicChart = useMemo(() => {
    if (sort?.value === 'ASC') {
      const sorted = data?.data?.toSorted((a, b) =>
        a?.label?.localeCompare(b?.label)
      );
      return dataMapping(sorted || [], 'label');
    }

    if (sort?.value === 'DESC') {
      const sorted = data?.data?.toSorted((a, b) =>
        b?.label?.localeCompare(a?.label)
      );
      return dataMapping(sorted || [], 'label');
    }

    return dataMapping(data?.data || [], 'label');
  }, [data, sort]);

  return {
    data: wasteBagCharacteristicChart,
    isLoading: isLoading || isFetching,
  };
}
