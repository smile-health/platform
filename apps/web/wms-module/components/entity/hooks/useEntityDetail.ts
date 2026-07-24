import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/toast';
import { useTranslation } from 'react-i18next';
import { getEntityWmsDetail } from '../../../services/entity';

export const useEntityDetail = () => {
  const {
    i18n: { language },
  } = useTranslation();
  const params = useParams();
  const id = params?.id;

  const {
    data: entity,
    isError: isErrorEntity,
    error,
    isFetching: isFetchingEntity,
  } = useQuery({
    queryKey: ['getEntityDetail', language],
    queryFn: () => getEntityWmsDetail(id as string),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isErrorEntity) {
      toast.danger({ description: error.message });
    }
  }, [isErrorEntity, error?.message]);

  return {
    entity,
    isLoading: isFetchingEntity,
    isError: isErrorEntity,
    error,
    id,
  };
};
