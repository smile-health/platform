'use client';

import React from 'react';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { ROLE_LABEL } from '@/types/roles';
import { getUserRoleString } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import { useTranslation } from 'react-i18next';
import HomeTPAdmin from './HomeTPAdmin';

const HomeListPage: React.FC = () => {
  usePermission('homepage-view');
  const { t } = useTranslation(['home']);
  const role = getUserRoleString();

  const renderHome = () => {
    if (role === ROLE_LABEL.THIRD_PARTY_ADMIN) {
      return <HomeTPAdmin />;
    }

    return (
      <Container title={t('home:title')} hideTabs={false} withLayout={true}>
        <Meta title={`WMS | ${t('home:title')}`} />
      </Container>
    );
  };

  return <div>{renderHome()}</div>;
};

export default HomeListPage;
