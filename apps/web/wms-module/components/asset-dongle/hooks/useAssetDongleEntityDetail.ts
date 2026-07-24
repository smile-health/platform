import { useTranslation } from 'react-i18next';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getEntityDetail } from '@/services/entity';
import { useParams } from 'next/navigation';

export const useAssetDongleEntityDetail = () => {
  const {
    i18n: { language },
  } = useTranslation(['common', 'assetDongle']);
  const { id } = useParams();

  const { data: entityData, isFetching: isFetchingEntityData, isLoading: isLoadingEntityData } = useQuery({
    queryKey: ['asset-dongle-entity-data', id, language],
    queryFn: () => getEntityDetail(id?.toString()),
    placeholderData: keepPreviousData,
  });

  return {
    entityData,
    isFetchingEntityData,
    isLoadingEntityData,
  };
};
