'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import BudgetSourceForm from './components/BudgetSourceForm';

const BudgetSourceCreatePage = (): JSX.Element => {
  usePermission('budget-source-mutate');
  const { t } = useTranslation('budgetSource');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <BudgetSourceForm />
      </div>
    </AppLayout>
  );
};

export default BudgetSourceCreatePage;
