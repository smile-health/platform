'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import WasteSourceForm from './components/WasteSourceForm';

const WasteSourceCreatePage = (): JSX.Element => {
  usePermission('waste-source-mutate');
  const { t } = useTranslation('wasteSource');

  return (
    <AppLayout title={t('title.create_waste_source')}>
      <Meta
        title={generateMetaTitle(t('title.create_waste_source'), false, false)}
      />
      <div className="mt-6">
        <WasteSourceForm />
      </div>
    </AppLayout>
  );
};

export default WasteSourceCreatePage;
