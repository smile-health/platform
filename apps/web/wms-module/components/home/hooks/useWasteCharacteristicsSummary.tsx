import { useTranslation } from 'react-i18next';

import { getWasteCharacteristicSummary } from '@/services/homepage';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type WasteCharacteristicsParams = {
  wasteTypeId: number;
  provinceId?: number;
  regencyId?: number;
  healthcareFacilityId?: number;
  startDate: string;
  endDate: string;
};

export const useWasteCharacteristicsSummary = ({
  wasteTypeId,
  provinceId,
  regencyId,
  healthcareFacilityId,
  startDate,
  endDate,
}: WasteCharacteristicsParams) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'home']);

  const {
    data: summaryWasteCharacteristics,
    isFetching: isSummaryWasteCharacteristicsFetching,
    refetch: refetchWasteHierarchy,
  } = useQuery({
    queryKey: ['summaryWasteCharacteristics', language],
    queryFn: () => {
      return getWasteCharacteristicSummary({
        wasteTypeId: wasteTypeId,
        provinceId: provinceId,
        cityId: regencyId,
        healthcareFacilityId: healthcareFacilityId,
        startDate: startDate,
        endDate: endDate,
      });
    },
    placeholderData: keepPreviousData,
  });

  return {
    refetchWasteHierarchy,
    summaryWasteCharacteristics,
    isSummaryWasteCharacteristicsFetching,
  };
};
