'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import HealthcareAssetListComponent from './components/HealthcareAssetListComponent';
import { HealthcareAssetListContext } from './utils/healthcare-asset-list.context';
import { getUserStorage } from '@/utils/storage/user';

const HealthcareAssetListPage: React.FC = () => {
  usePermission('healthcare-asset-view');
  const { t } = useTranslation(['common', 'healthcareAsset']);
  const user = getUserStorage();
  const contextValue = useMemo(
    () => ({ entityId: user?.entity_id ?? null, isAdmin: false }),
    [user]
  );
  return (
    <Container
      title={t('healthcareAsset:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Healthcare`} />
      <HealthcareAssetListContext.Provider value={contextValue}>
        <HealthcareAssetListComponent fromDetailAsset={false} />
      </HealthcareAssetListContext.Provider>
    </Container>
  );
};

export default HealthcareAssetListPage;
