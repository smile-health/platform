'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import UserOperatorForm from './components/UserOperatorForm';

const UserOperatorCreatePage = (): JSX.Element => {
  usePermission('user-operator-mutate');
  const { t } = useTranslation('userOperator');

  return (
    <AppLayout title={t('title.create')}>
      <Meta title={generateMetaTitle(t('title.create'), false, false)} />
      <div className="mt-6">
        <UserOperatorForm />
      </div>
    </AppLayout>
  );
};

export default UserOperatorCreatePage;
