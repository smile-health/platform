'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { ErrorResponse } from '@/types/common';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { getPrintLabelDetail } from '@/services/print-label';
import { GetPrintLabelDetailResponse } from '@/types/print-label';
import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import PrintLabelForm from './components/PrintLabelForm';

const PrintLabelEditPage = (): JSX.Element => {
  usePermission('print-label-mutate');
  const { t } = useTranslation('printLabel');
  const params = useParams();
  const { id } = params;

  const { data: dataPrintLabel, isFetching } = useQuery<
    GetPrintLabelDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['print-label-detail', id],
    queryFn: () => getPrintLabelDetail(Number(id)),
    enabled: Boolean(id),
  });

  return (
    <AppLayout title={t('title.edit')}>
      <Meta title={generateMetaTitle(t('title.edit'), false, false)} />
      <div className="mt-6">
        {isFetching ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <PrintLabelForm defaultValues={dataPrintLabel?.data} />
        )}
      </div>
    </AppLayout>
  );
};

export default PrintLabelEditPage;
