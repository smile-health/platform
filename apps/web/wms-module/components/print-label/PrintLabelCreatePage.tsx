'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import PrintLabelForm from './components/PrintLabelForm';

const PrintLabelCreatePage = (): JSX.Element => {
  usePermission('print-label-mutate');
  const { t } = useTranslation('printLabel');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <PrintLabelForm />
      </div>
    </AppLayout>
  );
};

export default PrintLabelCreatePage;
