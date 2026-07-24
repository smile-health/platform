'use client';

import { useParams } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePermission } from '@/utils/permission';
import { getUserWmsDetail } from '@/services/user';
import { getGlobalEntityType } from '@repo/ui/services/entity';

import UserDetailEntityInfo from './components/UserDetail/UserDetailEntityInfo';
import UserDetailMainInfo from './components/UserDetail/UserDetailMainInfo';

const UserDetailPage: React.FC = () => {
  usePermission('user-setting-view');
  const { t, i18n } = useTranslation(['common', 'userSetting']);
  const params = useParams<{ id: string }>();

  const [userDetail, entityType] = useQueries({
    queries: [
      {
        queryKey: ['userSetting-detail', params.id, i18n.language],
        queryFn: () => getUserWmsDetail(params.id),
        enabled: Boolean(params.id),
      },
      {
        queryKey: ['entity-type', i18n.language],
        queryFn: () => getGlobalEntityType({ page: 1, paginate: 100 }),
        enabled: Boolean(params.id),
      },
    ],
  });

  const userData = userDetail.data?.data;
  const entityData = userData?.entity;
  const entityTypeData = entityType.data?.data;

  return (
    <AppLayout
      title={t('userSetting:title.detail')}
      backButton={{ show: true }}
    >
      <Meta title={`WMS | User Detail`} />
      <div className="ui-space-y-6">
        <UserDetailMainInfo
          detailData={userData}
          isLoading={userDetail.isFetching}
        />
        <UserDetailEntityInfo
          entityData={entityData}
          isLoading={userDetail.isFetching}
          entityType={entityTypeData}
        />
      </div>
    </AppLayout>
  );
};

export default UserDetailPage;
