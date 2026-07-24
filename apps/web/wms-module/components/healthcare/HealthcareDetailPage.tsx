'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import HealthcareDetail from './components/HealthcareDetail';
import { useHealthcareEntityDetail } from './hooks/useHealthcareEntityDetail';

const HealthcareDetailPage: React.FC = () => {
  usePermission('healthcare-view');
  const { t, i18n } = useTranslation(['common', 'healthCare']);
  const router = useWmsRouter();
  const language = i18n.language;
  const { healthcareDetail, isLoading, error } = useHealthcareEntityDetail();

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout
      title={t('healthCare:title.healthcare')}
      backButton={{
        show: true,
        onClick: () => router.push(`/${language}/healthcare`),
      }}
    >
      <Meta title={`WMS | Healthcare`} />
      <HealthcareDetail data={healthcareDetail} isLoading={isLoading} />
    </AppLayout>
  );
};

export default HealthcareDetailPage;
