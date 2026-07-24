'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { getEntityWmsDetail } from '@/services/entity';
import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import AboutForm from './components/AboutForm';

const AboutEdit = (): JSX.Element => {
  usePermission('about-mutate');
  const {
    t,
    i18n: { language },
  } = useTranslation('about');

  const { data: entityDetail, isFetching: isFetchingEntity } = useQuery({
    queryKey: ['getEntityDetail', language],
    queryFn: () => getEntityWmsDetail(),
    placeholderData: keepPreviousData,
  });

  return (
    <AppLayout title={t('title.edit')}>
      <Meta title={generateMetaTitle('AssetType', true, true)} />
      <div className="mt-6 space-y-6">
        {isFetchingEntity ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <Fragment>
            <AboutForm defaultValues={entityDetail?.data} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default AboutEdit;
