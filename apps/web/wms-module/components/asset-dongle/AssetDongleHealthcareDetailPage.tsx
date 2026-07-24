'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { usePermission } from '@/utils/permission';
import { useQuery } from '@tanstack/react-query';
import { getAssetInventoryDetail } from '@/services/healthcare-asset';
import { useParams } from 'next/navigation';
import { Spinner } from '@repo/ui/components/spinner';
import HealthcareAssetDetailForm from '../healthcare-asset/components/HealthcareAssetDetailForm';
import { HealthCareAssetDetailContext } from '../healthcare-asset/utils/healthcare-asset-detail.context';

const AssetDongleHealthcareDetailPage: React.FC = () => {
  usePermission('healthcare-asset-view');
  const { t, i18n } = useTranslation(['common', 'healthcareAsset']);
  const router = useWmsRouter();
  const language = i18n.language;

  const params = useParams();
  const { id, healthcareId } = params;

  const { data: healthcareAssetDetail, isFetching } = useQuery({
    queryKey: ['healthcare-asset-detail', healthcareId, language],
    queryFn: () => getAssetInventoryDetail(Number(healthcareId)),
    enabled: Boolean(healthcareId),
  });

  const contextValue = useMemo(() => ({ isAdmin: true }), []);

  return (
    <AppLayout
      title={t('healthcareAsset:title.detail')}
      backButton={{
        show: true,
        onClick: () => router.push(`/${language}/asset-dongle/${id}`),
      }}
    >
      <Meta title={`WMS | Healthcare`} />
      <div className="mt-6 space-y-6">
        {isFetching ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <HealthCareAssetDetailContext.Provider value={contextValue}>
            <HealthcareAssetDetailForm
              defaultValues={healthcareAssetDetail?.data}
            />
          </HealthCareAssetDetailContext.Provider>
        )}
      </div>
    </AppLayout>
  );
};

export default AssetDongleHealthcareDetailPage;
