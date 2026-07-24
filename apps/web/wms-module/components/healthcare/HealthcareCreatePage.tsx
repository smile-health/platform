'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import HealthcareForm from './components/HealthcareForm';

const HealthcareCreatePage = (): JSX.Element => {
  usePermission('healthcare-mutate');
  const { t } = useTranslation('healthCare');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <HealthcareForm />
      </div>
    </AppLayout>
  );
};

export default HealthcareCreatePage;
