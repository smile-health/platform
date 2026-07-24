import { useQuery } from '@tanstack/react-query';
import { Values } from 'nuqs';

import {
  getChartWasteGroupSummary,
  getChartMonthlyWasteBagSummary,
} from '@/services/transaction-monitoring';
import { handleFilter } from '../utils/helper';
import { WASTE_GROUP_COLORS } from '../constants/transaction-monitoring.constant';
import { TChartResponse } from '@/types/transaction-monitoring';
import i18n from '@/locales/i18n';

export default function useGetWasteGroupChart(
  filter: Values<Record<string, any>>
) {
  const params = handleFilter(filter);

  const {
    data: dataWasteGroupSummary,
    isFetching: isFetchingWasteGroupSummary,
  } = useQuery({
    queryKey: ['waste-group-chart', params, i18n.language],
    queryFn: () => getChartWasteGroupSummary(params),
    select: (data) => {
      if (!data?.data) return data;

      const getWasteGroupColor = (labelType?: string) => {
        if (!labelType) return WASTE_GROUP_COLORS['Domestik'];
        return WASTE_GROUP_COLORS[labelType] || WASTE_GROUP_COLORS['Domestik'];
      };

      const getSortOrder = (labelType?: string) => {
        if (!labelType) return 3;
        switch (labelType) {
          case 'Klinis/Medis':
          case 'Clinical/Medical':
            return 1;
          case 'Limbah B3':
          case 'Hazardous and Toxic Waste (B3)':
            return 2;
          default:
            return 3;
        }
      };

      const processedData = data.data?.data
        ?.map((item: TChartResponse) => ({
          ...item,
          color: getWasteGroupColor(item?.labelType),
          sortOrder: getSortOrder(item.labelType),
        }))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(({ sortOrder, ...rest }) => rest);

      return {
        ...data,
        data: {
          ...data.data,
          data: processedData,
        },
      };
    },
  });

  const {
    data: dataMonthlyWasteBagSummary,
    isFetching: isFetchingMonthlyWasteBagSummary,
  } = useQuery({
    queryKey: ['monthly-waste-bag-chart', params],
    queryFn: () => getChartMonthlyWasteBagSummary(params),
  });

  return {
    dataWasteGroupSummary: dataWasteGroupSummary?.data,
    dataMonthlyWasteBagSummary: dataMonthlyWasteBagSummary?.data,
    isLoading: isFetchingMonthlyWasteBagSummary || isFetchingWasteGroupSummary,
  };
}
