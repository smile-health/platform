'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { useParams } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getWasteSpecificationDetail } from '@/services/waste-specification';
import { ErrorResponse } from '@/types/common';
import { GetWasteSpecificationDetailResponse } from '@/types/waste-specification';
import { usePermission } from '@/utils/permission';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import WasteSpecificationDetailInfo from './components/WasteSpecificationDetailInfo';

const WasteSpecificationDetailPage: React.FC = () => {
  usePermission('waste-specification-view');
  const params = useParams();
  const { t } = useTranslation(['common', 'wasteSpecification']);

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
    <AppLayout
      title={t('wasteSpecification:detail.title')}
      backButton={{ show: true }}
    >
      <Meta title={`WMS | Waste Specification`} />

      <div className="ui-space-y-6">
        <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
          <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
            <h5 className="ui-font-bold ui-text-dark-blue">Details</h5>
          </div>

          <WasteSpecificationDetailInfo
            data={dataWasteSpecification}
            isLoading={isLoadingWasteSpecification}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default WasteSpecificationDetailPage;
