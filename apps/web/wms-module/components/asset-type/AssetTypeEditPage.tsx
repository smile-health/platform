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

import { getAssetTypeDetail } from '@/services/asset-type';
import { GetAssetTypeDetailResponse } from '@/types/asset-type';
import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import AssetTypeForm from './components/AssetTypeForm';

const AssetTypeEdit = (): JSX.Element => {
  usePermission('asset-type-mutate');
  const { t } = useTranslation('assetType');
  const params = useParams();

  const { data, isLoading, error } = useQuery<
    GetAssetTypeDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['asset-type-detail', params?.id],
    queryFn: () => getAssetTypeDetail(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('list.list')}>
      <Meta title={generateMetaTitle('AssetType', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <Fragment>
            <AssetTypeForm defaultValues={data?.data} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default AssetTypeEdit;
