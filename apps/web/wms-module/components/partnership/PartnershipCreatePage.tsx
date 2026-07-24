'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import PartnershipForm from './components/PartnershipForm';

const PartnershipCreatePage = (): JSX.Element => {
  usePermission('partnership-mutate');
  const { t } = useTranslation('partnership');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <PartnershipForm />
      </div>
    </AppLayout>
  );
};

export default PartnershipCreatePage;
