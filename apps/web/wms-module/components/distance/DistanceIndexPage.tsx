'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import AppLayout from '../layouts/AppLayout/AppLayout';
import Meta from '../layouts/Meta';

import { isSuperAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import DistanceForm from './components/DistanceForm';

const DistanceIndexPage: React.FC = () => {
  usePermission(
    isSuperAdmin() ? 'global-distance-limit-mutate' : 'distance-limit-mutate'
  );
  const { t } = useTranslation(['common', 'distance']);

  return (
    <AppLayout title={t('distance:index.title')}>
      <Meta title={`WMS | Distance`} />

      <div className="ui-space-y-6">
        <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
          <DistanceForm />
        </div>
      </div>
    </AppLayout>
  );
};

export default DistanceIndexPage;
