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

import { getBudgetSourceDetail } from '@/services/budget-source';
import { GetBudgetSourceDetailResponse } from '@/types/budget-source';
import { usePermission } from '@/utils/permission';
import { Spinner } from '@repo/ui/components/spinner';
import Error403Page from '../error/Error403Page';
import Error404Page from '../error/Error404Page';
import BudgetSourceForm from './components/BudgetSourceForm';

const BudgetSourceEdit = (): JSX.Element => {
  usePermission('budget-source-mutate');
  const { t } = useTranslation('budgetSource');
  const params = useParams();

  const { data, isLoading, error } = useQuery<
    GetBudgetSourceDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['budget-source-detail', params?.id],
    queryFn: () => getBudgetSourceDetail(Number(params?.id)),
    enabled: Boolean(params?.id),
  });

  if (error?.response?.status === 403) return <Error403Page />;
  if (error?.response?.status === 404) return <Error404Page />;
  if (error?.response?.status === 422) return <Error404Page />;

  return (
    <AppLayout title={t('list.list')}>
      <Meta title={generateMetaTitle('BudgetSource', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <Fragment>
            <BudgetSourceForm defaultValues={data?.data} />
          </Fragment>
        )}
      </div>
    </AppLayout>
  );
};

export default BudgetSourceEdit;
