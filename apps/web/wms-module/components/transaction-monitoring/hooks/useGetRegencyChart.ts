import { useQuery } from '@tanstack/react-query';
import { OptionType } from '@repo/ui/components/react-select';
import { Values } from 'nuqs';

import { handleFilter } from '../utils/helper';
import i18n from '@/locales/i18n';

import { getChartRegencyWasteBagSummary } from '@/services/transaction-monitoring';

export default function useGetRegencyChart(
  filter: Values<Record<string, any>>,
  sort: OptionType | null
) {
  const params = handleFilter({ orderBy: sort?.value, ...filter });

  const { data, isFetching } = useQuery({
    queryKey: ['regency-chart', params, sort?.value, i18n.language],
    queryFn: () => getChartRegencyWasteBagSummary(params),
  });

  return { data: data?.data || [], isLoading: isFetching };
}
