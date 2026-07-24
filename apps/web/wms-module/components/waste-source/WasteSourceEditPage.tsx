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

import { getWasteSourceDetail } from '@/services/waste-source';
import { GetWasteSourceDetailResponse } from '@/types/waste-source';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import WasteSourceSkeleton from './components/Skeleton/WasteSourceSkeleton';
import WasteSourceForm from './components/WasteSourceForm';

const WasteSourceEditPage = (): JSX.Element => {
  usePermission('waste-source-mutate');
  const { t } = useTranslation('wasteSource');
  const params = useParams();

  const { id } = params;

  const {
    data: dataWasteSource,
    isLoading: isLoadingWasteSource,
    error: errorWasteSource,
  } = useQuery<GetWasteSourceDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['waste-source-detail', id],
    queryFn: () => getWasteSourceDetail(Number(id)),
    enabled: Boolean(id),
  });

  if (errorWasteSource?.response?.status === 403) return <Error403Page />;
  if (errorWasteSource?.response?.status === 404) return <Error404Page />;
  if (errorWasteSource?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('list.list')}>
      <Meta title={generateMetaTitle('Waste Source', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoadingWasteSource ? (
          <WasteSourceSkeleton />
        ) : (
          <Fragment>
            <WasteSourceForm defaultValues={dataWasteSource} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default WasteSourceEditPage;
