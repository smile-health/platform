'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';

import { ErrorResponse } from '@/types/common';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@repo/ui/components/spinner';
import PartnershipVehicleForm from './components/PartnershipVehicleForm';

import { getPartnershipVehicleDetail } from '@/services/partnership-vehicle';
import { GetPartnershipVehicleDetailResponse } from '@/types/partnership-vehicle';
import { usePermission } from '@/utils/permission';

const PartnershipVehicleEditPage = (): JSX.Element => {
  usePermission('transport-vehicle-mutate');
  const { t } = useTranslation(['common', 'partnershipVehicle']);
  const params = useParams();
  const { id } = params;

  const { data, isFetching } = useQuery<
    GetPartnershipVehicleDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['partnership-vehicle-detail', id],
    queryFn: () => getPartnershipVehicleDetail(Number(id)),
    enabled: Boolean(id),
  });

  return (
    <AppLayout title={t('partnershipVehicle:title.edit')}>
      <Meta title={generateMetaTitle('Manufacture', true, true)} />
      <div className="mt-6 space-y-6">
        {isFetching ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <PartnershipVehicleForm defaultValues={data?.data} />
        )}
      </div>
    </AppLayout>
  );
};

export default PartnershipVehicleEditPage;
