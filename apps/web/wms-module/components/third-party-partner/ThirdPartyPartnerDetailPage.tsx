'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import ThirdPartyPartnerDetail from './components/ThirdPartyPartnerDetail';
import { useThirdPartyPartnerDetail } from './hooks/useThirdPartyPartnerDetail';

const ThirdPartyPartnerDetailPage: React.FC = () => {
  usePermission('thirdparty-partner-view');
  const { t } = useTranslation(['common', 'thirdPartyPartner']);

  const { partnershipDetail, partnershipOperatorData, isLoading } =
    useThirdPartyPartnerDetail();

  return (
    <AppLayout
      title={t('thirdPartyPartner:title.partnership')}
      backButton={{ show: true }}
    >
      <Meta title={`WMS | ThirdPartyPartner`} />
      <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
        <ThirdPartyPartnerDetail
          data={partnershipDetail}
          isLoading={isLoading}
          operatorData={partnershipOperatorData}
        />
      </div>
    </AppLayout>
  );
};

export default ThirdPartyPartnerDetailPage;
