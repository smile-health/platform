'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import WasteSpecificationForm from './components/WasteSpecificationForm';

const WasteSpecificationCreatePage = (): JSX.Element => {
  usePermission('waste-specification-mutate');
  const { t } = useTranslation('wasteSpecification');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <WasteSpecificationForm />
      </div>
    </AppLayout>
  );
};

export default WasteSpecificationCreatePage;
