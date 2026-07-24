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

import { getWasteHierarchyDetail } from '@/services/waste-hierarchy';
import {
  GetWasteCharacteristicDetailResponse,
  GetWasteGroupDetailResponse,
  GetWasteTypeDetailResponse,
} from '@/types/waste-hierarchy';
import { usePermission } from '@/utils/permission';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import WasteCharacteristicSkeleton from './components/Skeleton/WasteCharacteristicSkeleton';
import WasteGroupSkeleton from './components/Skeleton/WasteGroupSkeleton';
import WasteTypeSkeleton from './components/Skeleton/WasteTypeSkeleton';
import WasteCharacteristicForm from './components/WasteCharacteristicForm';
import WasteGroupForm from './components/WasteGroupForm';
import WasteTypeForm from './components/WasteTypeForm';

const WasteHierarchyEditPage = (): JSX.Element => {
  usePermission('waste-hierarchy-mutate');
  const { t } = useTranslation('wasteHierarchy');
  const params = useParams();

  const { id, type } = params;

  const isWasteType = type === 'waste_type';
  const isWasteGroup = type === 'waste_group';
  const isWasteCharacteristic = type === 'waste_characteristic';

  const {
    data: dataWasteType,
    isLoading: isLoadingWasteType,
    error: errorWasteType,
  } = useQuery<GetWasteTypeDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['waste-type-detail', id],
    queryFn: () => getWasteHierarchyDetail(Number(id)),
    enabled: Boolean(id) && isWasteType,
  });

  const {
    data: dataWasteGroup,
    isLoading: isLoadingWasteGroup,
    error: errorWasteGroup,
  } = useQuery<GetWasteGroupDetailResponse, AxiosError<ErrorResponse>>({
    queryKey: ['waste-group-detail', id],
    queryFn: async () => {
      const response = await getWasteHierarchyDetail(Number(id));
      if ('wasteType' in response.data) {
        return response as GetWasteGroupDetailResponse;
      }
      throw new Error('Invalid response type - expected waste group');
    },
    enabled: Boolean(id) && isWasteGroup,
  });

  const {
    data: dataWasteCharacteristic,
    isLoading: isLoadingWasteCharacteristic,
    error: errorWasteCharacteristic,
  } = useQuery<GetWasteCharacteristicDetailResponse, AxiosError<ErrorResponse>>(
    {
      queryKey: ['waste-characteristic-detail', id],
      queryFn: async () => {
        const response = await getWasteHierarchyDetail(Number(id));
        if ('wasteGroup' in response.data) {
          return response as GetWasteCharacteristicDetailResponse;
        }
        throw new Error(
          'Invalid response type - expected waste characteristic'
        );
      },
      enabled: Boolean(id) && isWasteCharacteristic,
    }
  );

  if (isWasteType) {
    if (errorWasteType?.response?.status === 403) return <Error403Page />;
    if (errorWasteType?.response?.status === 404) return <Error404Page />;
    if (errorWasteType?.response?.status === 422) return <Error404Page />;
  } else if (isWasteGroup) {
    if (errorWasteGroup?.response?.status === 403) return <Error403Page />;
    if (errorWasteGroup?.response?.status === 404) return <Error404Page />;
    if (errorWasteGroup?.response?.status === 422) return <Error404Page />;
  } else {
    if (errorWasteCharacteristic?.response?.status === 403)
      return <Error403Page />;
    if (errorWasteCharacteristic?.response?.status === 404)
      return <Error404Page />;
    if (errorWasteCharacteristic?.response?.status === 422)
      return <Error404Page />;
  }

  return (
    <AppLayout
      title={
        isWasteType
          ? t('list.tab.waste_type')
          : isWasteGroup
            ? t('list.tab.waste_group')
            : t('list.tab.waste_characteristic')
      }
    >
      <Meta title={generateMetaTitle('Waste Hierarchy', true, true)} />
      <div className="mt-6 space-y-6">
        {isWasteType ? (
          isLoadingWasteType ? (
            <WasteTypeSkeleton />
          ) : (
            <Fragment>
              <WasteTypeForm defaultValues={dataWasteType} />
            </Fragment>
          )
        ) : isWasteGroup ? (
          isLoadingWasteGroup ? (
            <WasteGroupSkeleton />
          ) : (
            <Fragment>
              <WasteGroupForm defaultValues={dataWasteGroup} />
            </Fragment>
          )
        ) : isLoadingWasteCharacteristic ? (
          <WasteCharacteristicSkeleton />
        ) : (
          <Fragment>
            <WasteCharacteristicForm defaultValues={dataWasteCharacteristic} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default WasteHierarchyEditPage;
