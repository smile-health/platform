'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';

import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@repo/ui/components/spinner';
import PartnershipForm from './components/PartnershipForm';

import { usePermission } from '@/utils/permission';
import { usePartnershipDetail } from './hooks/usePartnershipDetail';

const PartnershipEditPage = (): JSX.Element => {
  usePermission('partnership-mutate');
  const { t } = useTranslation(['common', 'partnership']);

  const { partnershipDetail, isLoading } = usePartnershipDetail();

  return (
    <AppLayout title={t('partnership:title.edit')}>
      <Meta title={generateMetaTitle('Manufacture', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <PartnershipForm defaultValues={partnershipDetail} />
        )}
      </div>
    </AppLayout>
  );
};

export default PartnershipEditPage;
