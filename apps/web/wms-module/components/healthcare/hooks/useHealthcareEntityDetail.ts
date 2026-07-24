import { useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getEntityDetail } from '../../../services/entity';
import { getHealthcareDetail } from '../../../services/healthcare';
import type { GetHealthcareDetailResponse } from '../../../types/healthcare';
import type { AxiosError } from 'axios';
import type { ErrorResponse } from '../../../types/common';
import { toast } from '@repo/ui/components/toast';

export const useHealthcareEntityDetail = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();
  const id = params?.id;

  const {
    data: healthcareDetail,
    isError: isErrorHealthcare,
    error: errorHealthcare,
    isFetching: isFetchingHealthcare,
  } = useQuery<GetHealthcareDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['healthcare-detail', id, language],
    queryFn: () => getHealthcareDetail(Number(id)),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
  });

  const healthcareFacilityId = healthcareDetail?.data?.healthcareFacilityId;

  const {
    data: entityDetail,
    isError: isErrorEntity,
    error: errorEntity,
    isFetching: isFetchingEntity,
  } = useQuery({
    queryKey: ['getEntityDetail', healthcareFacilityId, language],
    queryFn: () => getEntityDetail(Number(healthcareFacilityId)),
    enabled: Boolean(healthcareFacilityId),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorHealthcare) {
      toast.danger({ description: errorHealthcare?.message });
    }
    if (isErrorEntity) {
      toast.danger({ description: errorEntity?.message });
    }
  }, [
    isErrorHealthcare,
    errorHealthcare?.message,
    isErrorEntity,
    errorEntity?.message,
  ]);

  const finalHealthcareDetail = useMemo(() => {
    if (!healthcareDetail?.data) return undefined;

    return {
      ...healthcareDetail.data,
      healthcareFacilityName: entityDetail?.name ?? '',
    };
  }, [healthcareDetail, entityDetail]);

  return {
    healthcareDetail: finalHealthcareDetail,
    isLoading: isFetchingHealthcare || isFetchingEntity,
    isError: isErrorHealthcare || isErrorEntity,
    error: errorHealthcare,
  };
};
