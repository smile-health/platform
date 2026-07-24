'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import AssetDongleForm from './components/AssetDongleForm';

const AssetDongleCreatePage = (): JSX.Element => {
  usePermission('asset-dongle-mutate');
  const { t } = useTranslation('assetDongle');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <AssetDongleForm />
      </div>
    </AppLayout>
  );
};

export default AssetDongleCreatePage;
