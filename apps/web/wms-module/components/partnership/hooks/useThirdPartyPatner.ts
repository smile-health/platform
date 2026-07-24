import { useEffect, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getThirdpartyPatnerList } from '../../../services/partnership';
import type { GetThirdpartyPatnerResponse } from '../../../types/partnership';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../types/common';
import { toast } from '@repo/ui/components/toast';
import { OptionType } from '@repo/ui/components/react-select';

export const useThirdPartyPatner = () => {
  const {
    i18n: { language },
  } = useTranslation();

  const {
    data: thirdPartyPatnerList,
    isError: isErrorThirdPartyPatner,
    error: errorThirdPartyPatner,
    isFetching: isFetchingThirdPartyPatner,
  } = useQuery<GetThirdpartyPatnerResponse, AxiosError<ErrorResponse>>({
    queryKey: ['third-party-patner', language],
    queryFn: () => getThirdpartyPatnerList(),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorThirdPartyPatner) {
      toast.danger({ description: errorThirdPartyPatner?.message });
    }
  }, [isErrorThirdPartyPatner, errorThirdPartyPatner?.message]);
  const options: OptionType[] = useMemo(
    () =>
      thirdPartyPatnerList?.data?.map((item) => ({
        label: item.providerName,
        value: item.providerId,
      })) ?? [],
    [thirdPartyPatnerList]
  );

  return {
    options,
    isLoading: isFetchingThirdPartyPatner,
    isError: isErrorThirdPartyPatner,
    error: errorThirdPartyPatner,
  };
};
