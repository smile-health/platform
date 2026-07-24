'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import ManufactureForm from './components/ManufactureForm';

const ManufactureCreatePage = (): JSX.Element => {
  usePermission('manufacture-mutate');
  const { t } = useTranslation('manufacture');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <ManufactureForm />
      </div>
    </AppLayout>
  );
};

export default ManufactureCreatePage;
