'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import { getUserOperatorStorage } from '@/utils/storage/user-operator';
import Error404Page from '../error/Error404Page';
import UserOperatorForm from './components/UserOperatorForm';

const UserOperatorEditPage = (): JSX.Element => {
  usePermission('user-operator-mutate');
  const { t } = useTranslation('userOperator');
  const userOperator = getUserOperatorStorage();

  if (userOperator === null) return <Error404Page />;

  return (
    <AppLayout title={t('list.list')}>
      <Meta title={generateMetaTitle('User Operator', true, true)} />
      <div className="mt-6 space-y-6">
        <UserOperatorForm defaultValues={userOperator} />
      </div>
    </AppLayout>
  );
};

export default UserOperatorEditPage;
