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

import { getManufactureDetail } from '@/services/manufacture';
import { GetManufactureDetailResponse } from '@/types/manufacture';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import ManufactureForm from './components/ManufactureForm';
import ManufactureSkeleton from './components/Skeleton/ManufactureSkeleton';

const ManufactureEdit = (): JSX.Element => {
  usePermission('manufacture-mutate');
  const { t } = useTranslation('manufacture');
  const params = useParams();

  const { data, isLoading, error } = useQuery<
    GetManufactureDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['manufacture-detail', params?.id],
    queryFn: () => getManufactureDetail(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('list.list')}>
      <Meta title={generateMetaTitle('Manufacture', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <ManufactureSkeleton />
        ) : (
          <Fragment>
            <ManufactureForm
              defaultValues={data as GetManufactureDetailResponse}
            />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default ManufactureEdit;
