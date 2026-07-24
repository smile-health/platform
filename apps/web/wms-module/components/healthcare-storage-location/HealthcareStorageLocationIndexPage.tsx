'use client';

import { isSuperAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../layouts/AppLayout/AppLayout';
import Meta from '../layouts/Meta';
import HealthcareStorageLocationForm from './components/HealthcareStorageLocationForm';
import HealthcareStorageLocationTable from './components/HealthcareStorageLocationTable';
import TooltipModal from '../TooltipModal';

const HealthcareStorageLocationIndexPage: React.FC = () => {
  usePermission('healthcare-storage-location-mutate');
  const { t } = useTranslation(['common', 'healthcareStorageLocation']);
  const [openInformation, setOpenInformation] = useState(false);

  return (
    <AppLayout
      title={t('healthcareStorageLocation:index.title')}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Healthcare Storage Location`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('healthcareStorageLocation:information.title')}
        description={t('healthcareStorageLocation:information.description')}
      />
      <div className="ui-space-y-6">
        {isSuperAdmin() ? (
          <HealthcareStorageLocationTable />
        ) : (
          <HealthcareStorageLocationForm />
        )}
      </div>
    </AppLayout>
  );
};

export default HealthcareStorageLocationIndexPage;
