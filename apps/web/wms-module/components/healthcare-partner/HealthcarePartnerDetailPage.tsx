'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import HealthcarePartnerForm from './components/HealthcarePartnerForm';
import { useHealthcarePartnerDetail } from './hooks/useHealthcarePartnerDetail';

const HealthcarePartnerDetailPage: React.FC = () => {
  usePermission('healthcare-partner-view');
  const { t } = useTranslation(['common', 'healthcarePartner']);

  const { partnershipDetail, isLoading } = useHealthcarePartnerDetail();

  return (
    <AppLayout
      title={t('healthcarePartner:title.partnership')}
      backButton={{ show: true }}
    >
      <Meta title={`WMS | HealthcarePartner`} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <HealthcarePartnerForm defaultValues={partnershipDetail} />
        )}
      </div>
    </AppLayout>
  );
};

export default HealthcarePartnerDetailPage;
