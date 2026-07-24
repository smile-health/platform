import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getPartnershipDetail } from '../../../services/partnership';
import type { GetPartnershipDetailResponse } from '../../../types/partnership';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../types/common';
import { toast } from '@repo/ui/components/toast';

export const useHealthcarePartnerDetail = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();
  const id = params?.id;

  // HealthcarePartner detail
  const {
    data: partnershipDetail,
    isError: isErrorHealthcarePartner,
    error: errorHealthcarePartner,
    isFetching: isFetchingHealthcarePartner,
  } = useQuery<GetPartnershipDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['partnership-detail', id, language],
    queryFn: () => getPartnershipDetail(Number(id)),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorHealthcarePartner) {
      toast.danger({ description: errorHealthcarePartner?.message });
    }
  }, [isErrorHealthcarePartner, errorHealthcarePartner?.message]);

  return {
    partnershipDetail: partnershipDetail?.data,
    isLoading: isFetchingHealthcarePartner,
    isError: isErrorHealthcarePartner,
    error: errorHealthcarePartner,
  };
};
