'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import PartnershipVehicleForm from './components/PartnershipVehicleForm';

const PartnershipVehicleCreatePage = (): JSX.Element => {
  usePermission('transport-vehicle-mutate');
  const { t } = useTranslation('partnershipVehicle');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <PartnershipVehicleForm />
      </div>
    </AppLayout>
  );
};

export default PartnershipVehicleCreatePage;
