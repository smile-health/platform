/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'

import { handleMicroplanningFilter } from '../../dashboard.helper'
import {
  getDataTargetConsumptionVaccination
} from '../dashboard-microplanning.service'
import { MicroplanningDashboardType } from '../dashboard-microplanning.constant'

export default function useChartVaccineData<T extends MicroplanningDashboardType>(
  filter: Values<Record<string, any>>,
  tab: T,
  submitKey: number
) {

  const params = handleMicroplanningFilter(filter)

  const {
    data: mock,
    isLoading: istotalTargetLoading,
    isFetching: istotalTargetFetching,
  } = useQuery({
    queryKey: ['chart-vaccine', params, tab, submitKey],
    queryFn: () => getDataTargetConsumptionVaccination(params, tab),
  })

  if ((mock as any)?.aggregate) {
    const agg = (mock as any).aggregate.details;

    const labels = Object.keys(agg.target ?? {});

    return {
      labels,
      datasets: [
        {
          label: 'Target',
          data: labels.map((k) => agg.target[k] ?? 0),
          backgroundColor: '#3B82F6',
        },
        {
          label: 'Consumption',
          data: labels.map((k) => agg.consumption[k] ?? 0),
          backgroundColor: '#9ebbe9ff',
        },
      ],
    };
  }

  return {
    labels: mock?.labels ?? [],
    datasets:
      mock?.datasets?.map(({ ...rest }) => ({
        ...rest,
        minBarLength: 1,
      })) ?? [],
    isLoading: istotalTargetLoading,
    isFetching: istotalTargetFetching
  }
}
