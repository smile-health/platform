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
import HealthcareAssetDetailForm from './components/HealthcareAssetDetailForm';
import { HealthCareAssetDetailContext } from './utils/healthcare-asset-detail.context';

const HealthcareAssetDetailPage: React.FC = () => {
  usePermission('healthcare-asset-view');
  const { t, i18n } = useTranslation(['common', 'healthcareAsset']);
  const router = useWmsRouter();
  const language = i18n.language;

  const params = useParams();
  const { id } = params;

  const { data: healthcareAssetDetail, isFetching } = useQuery({
    queryKey: ['healthcare-asset-detail', id, language],
    queryFn: () => getAssetInventoryDetail(Number(id)),
    enabled: Boolean(id),
  });

  const contextValue = useMemo(() => ({ isAdmin: false }), []);

  return (
    <AppLayout
      title={t('healthcareAsset:title.detail')}
      backButton={{
        show: true,
        onClick: () => router.push(`/${language}/healthcare-asset`),
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

export default HealthcareAssetDetailPage;
