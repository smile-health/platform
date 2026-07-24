'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import TreatmentLocationForm from './components/TreatmentLocationForm';

const TreatmentLocationCreatePage = (): JSX.Element => {
  usePermission('treatment-location-mutate');
  const { t } = useTranslation('treatmentLocation');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <TreatmentLocationForm />
      </div>
    </AppLayout>
  );
};

export default TreatmentLocationCreatePage;
