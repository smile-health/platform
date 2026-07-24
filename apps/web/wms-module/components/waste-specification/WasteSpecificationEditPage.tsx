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

import { getWasteSpecificationDetail } from '@/services/waste-specification';
import { GetWasteSpecificationDetailResponse } from '@/types/waste-specification';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import WasteSpecificationSkeleton from './components/Skeleton/WasteSpecificationSkeleton';
import WasteSpecificationForm from './components/WasteSpecificationForm';

const WasteSpecificationEditPage = (): JSX.Element => {
  usePermission('waste-specification-mutate');
  const { t } = useTranslation('wasteSpecification');
  const params = useParams();

  const { id } = params;

  const {
    data: dataWasteSpecification,
    isLoading: isLoadingWasteSpecification,
    error: errorWasteSpecification,
  } = useQuery<GetWasteSpecificationDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['waste-specification-detail', id],
    queryFn: () => getWasteSpecificationDetail(Number(id)),
    enabled: Boolean(id),
  });

  if (errorWasteSpecification?.response?.status === 403)
    return <Error403Page />;
  if (errorWasteSpecification?.response?.status === 404)
    return <Error404Page />;
  if (errorWasteSpecification?.response?.status === 422)
    return <Error404Page />;

  return (
    <AppLayout title={t('title.waste_specification')}>
      <Meta title={generateMetaTitle('Waste Specification', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoadingWasteSpecification ? (
          <WasteSpecificationSkeleton />
        ) : (
          <Fragment>
            <WasteSpecificationForm defaultValues={dataWasteSpecification} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default WasteSpecificationEditPage;
