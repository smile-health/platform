'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { usePermission } from '@/utils/permission';
import HealthcareAssetListComponent from '../healthcare-asset/components/HealthcareAssetListComponent';
import { HealthcareAssetListContext } from '../healthcare-asset/utils/healthcare-asset-list.context';
import { useAssetDongleEntityDetail } from './hooks/useAssetDongleEntityDetail';
import { useSetLoadingPopupStore } from '@repo/ui/hooks/useSetLoading';

const AssetDongleHealthcareListPage = () => {
  usePermission('healthcare-asset-view');
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'assetDongle']);
  const router = useWmsRouter();
  const { id } = useParams();
  const {
    entityData,
    isFetchingEntityData,
    isLoadingEntityData,
  } = useAssetDongleEntityDetail();

  useSetLoadingPopupStore(isFetchingEntityData || isLoadingEntityData);

  const contextValue = useMemo(
    () => ({ entityId: Number(id), isAdmin: true }),
    [id]
  );
  return (
    <Container
      title={`${t('assetDongle:list.list')} ${entityData?.name ?? ''}`}
      hideTabs={false}
      withLayout={true}
      backButton={{
        show: true,
        onClick: () => router.push(`/${language}/asset-dongle`),
      }}
    >
      <Meta title={`WMS | ${t('assetDongle:list.list')}`} />
      <HealthcareAssetListContext.Provider value={contextValue}>
        <HealthcareAssetListComponent fromDetailAsset={true} />
      </HealthcareAssetListContext.Provider>
    </Container>
  );
};

export default AssetDongleHealthcareListPage;
