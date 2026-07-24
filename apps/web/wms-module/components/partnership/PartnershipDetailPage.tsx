'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import PartnershipDetail from './components/PartnershipDetail';
import { usePartnershipDetail } from './hooks/usePartnershipDetail';

const PartnershipDetailPage: React.FC = () => {
  usePermission('partnership-view');
  const { t } = useTranslation(['common', 'partnership']);

  const {
    partnershipDetail,
    partnershipVehicleData,
    classification,
    operator,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = usePartnershipDetail();

  return (
    <AppLayout
      title={t('partnership:title.partnership')}
      backButton={{ show: true }}
    >
      <Meta title={`WMS | Partnership`} />
      <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
        <PartnershipDetail
          data={partnershipDetail}
          classification={classification}
          operator={operator}
          vehicleData={partnershipVehicleData}
          page={page}
          paginate={paginate}
          handleChangePage={handleChangePage}
          handleChangePaginate={handleChangePaginate}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
};

export default PartnershipDetailPage;
