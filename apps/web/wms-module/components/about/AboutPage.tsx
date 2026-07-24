'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getEntityWmsDetail } from '@/services/entity';
import { usePermission } from '@/utils/permission';
import { getUserStorage } from '@/utils/storage/user';
import AboutDetailInfo from './components/AboutDetailInfo';

const AboutPage: React.FC = () => {
  usePermission('about-query');
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'about']);
  const user = getUserStorage();

  const { data: entityDetail, isFetching: isFetchingEntity } = useQuery({
    queryKey: ['getEntityDetail', language],
    queryFn: () => getEntityWmsDetail(),
    enabled: !!user?.entity_id,
    placeholderData: keepPreviousData,
  });

  return (
    <AppLayout title={t('about:list.list')} backButton={{ show: true }}>
      <Meta title={`WMS | About`} />
      <div className="mt-6 space-y-6">
        <AboutDetailInfo
          data={entityDetail?.data}
          isLoading={isFetchingEntity}
        />
      </div>
    </AppLayout>
  );
};

export default AboutPage;
