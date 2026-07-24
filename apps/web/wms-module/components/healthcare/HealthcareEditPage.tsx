'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import HealthcareForm from './components/HealthcareForm';
import { useHealthcareEntityDetail } from './hooks/useHealthcareEntityDetail';

const HealthcareEditPage = (): JSX.Element => {
  usePermission('healthcare-mutate');
  const { t } = useTranslation('healthCare');
  const { healthcareDetail, isLoading, error } = useHealthcareEntityDetail();

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('title.edit')}>
      <Meta title={generateMetaTitle('Manufacture', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <HealthcareForm defaultValues={healthcareDetail} />
        )}
      </div>
    </AppLayout>
  );
};

export default HealthcareEditPage;
