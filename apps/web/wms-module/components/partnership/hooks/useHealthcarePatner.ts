import { useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getHealthcareThirdpartyList } from '../../../services/partnership';
import type { GetHealthcareThirdpartyResponse } from '../../../types/partnership';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../types/common';
import { toast } from '@repo/ui/components/toast';
import { OptionType } from '@repo/ui/components/react-select';

export const useHealthcarePatner = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const {
    data: healthcarePatnerList,
    isError: isErrorHealthcarePatner,
    error: errorHealthcarePatner,
    isFetching: isFetchingHealthcarePatner,
  } = useQuery<GetHealthcareThirdpartyResponse, AxiosError<ErrorResponse>>({
    queryKey: ['healthcare-patner', language],
    queryFn: () => getHealthcareThirdpartyList(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorHealthcarePatner) {
      toast.danger({ description: errorHealthcarePatner?.message });
    }
  }, [isErrorHealthcarePatner, errorHealthcarePatner?.message]);

  const options: OptionType[] = useMemo(
    () =>
      healthcarePatnerList?.data?.map((item) => ({
        label: item.consumerName,
        value: item.consumerId,
      })) ?? [],
    [healthcarePatnerList]
  );

  return {
    options,
    isLoading: isFetchingHealthcarePatner,
    isError: isErrorHealthcarePatner,
    error: errorHealthcarePatner,
  };
};
