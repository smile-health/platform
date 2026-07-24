import { toast } from '@repo/ui/components/toast';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useParams, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPartnershipDetail } from '../../../services/partnership';
import type { ErrorResponse } from '../../../types/common';
import type { GetPartnershipDetailResponse } from '../../../types/partnership';

import { getPartnershipOperator } from '@/services/partnership-operator';

export const useThirdPartyPartnerDetail = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();
  const pathname = usePathname();
  const id = params?.id;
  const isNotEdit = !pathname.includes('/edit');

  const {
    data: partnershipDetail,
    isError: isErrorThirdPartyPartner,
    error: errorThirdPartyPartner,
    isFetching: isFetchingThirdPartyPartner,
  } = useQuery<GetPartnershipDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['partnership-detail', id, language],
    queryFn: () => getPartnershipDetail(Number(id)),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });
  const partnershipConsumerId = partnershipDetail?.data?.consumerId;
  const providerId = partnershipDetail?.data?.providerId;

  // Operator
  const {
    data: partnershipOperatorData,
    isError: isErrorOperatorList,
    error: errorOperatorList,
    isFetching: isFetchingOperatorList,
  } = useQuery({
    queryKey: ['getPartnershipOperator', partnershipConsumerId, language],
    queryFn: () =>
      getPartnershipOperator({
        search: String(partnershipConsumerId),
        page: 1,
        limit: 100,
        providerId: providerId,
      }),
    enabled: Boolean(partnershipConsumerId && isNotEdit),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorThirdPartyPartner) {
      toast.danger({ description: errorThirdPartyPartner?.message });
    }
  }, [isErrorThirdPartyPartner, errorThirdPartyPartner?.message]);

  return {
    partnershipDetail: partnershipDetail?.data,
    partnershipOperatorData: partnershipOperatorData?.data?.data ?? [],
    isLoading: isFetchingThirdPartyPartner || isFetchingOperatorList,
    isError: isErrorThirdPartyPartner || isErrorOperatorList,
    error: errorThirdPartyPartner || errorOperatorList,
  };
};
