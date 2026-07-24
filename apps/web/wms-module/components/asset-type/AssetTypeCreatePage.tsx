'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import AssetTypeForm from './components/AssetTypeForm';

const AssetTypeCreatePage = (): JSX.Element => {
  usePermission('asset-type-mutate');
  const { t } = useTranslation('assetType');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <AssetTypeForm />
      </div>
    </AppLayout>
  );
};

export default AssetTypeCreatePage;
