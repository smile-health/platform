'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { ErrorResponse } from '@/types/common';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { getEntityLocationDetail } from '@/services/entity-location';
import { GetEntityLocationResponse } from '@/types/entity-location';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import TreatmentLocationSkeleton from './components/Skeleton/TreatmentLocationSkeleton';
import TreatmentLocationForm from './components/TreatmentLocationForm';

const TreatmentLocationEditPage = (): JSX.Element => {
  usePermission('treatment-location-mutate');
  const { t } = useTranslation('treatmentLocation');
  const params = useParams();

  const { data, isLoading, error } = useQuery<
    GetEntityLocationResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['treatment-location-detail', params?.id],
    queryFn: () => getEntityLocationDetail(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('title.edit')}>
      <Meta title={generateMetaTitle('Manufacture', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <TreatmentLocationSkeleton />
        ) : (
          <Fragment>
            <TreatmentLocationForm
              defaultValues={data as GetEntityLocationResponse}
            />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default TreatmentLocationEditPage;
