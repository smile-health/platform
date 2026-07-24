'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { parseDateTime } from '#utils/date'
import { useTranslation } from 'react-i18next'

import { columsDetailReconciliation } from './constants/table'
import useReconciliationDetail from './hooks/useReconciliationDetail'

const ReconciliationDetailPage = () => {
  const { t } = useTranslation([
    'reconciliation',
    'reconciliationDetail',
    'common',
  ])
  const router = useRouter()
  const params = useParams()

  const { detail, isLoading } = useReconciliationDetail(params?.id as string)

  const subTitle = isLoading
    ? '-'
    : `${detail?.entity.name} - ${detail?.material.name}`

  return (
    <Container
      title={t('reconciliation:title.history.reconciliation')}
      subTitle={subTitle}
      withLayout
    >
      <Meta title={t('reconciliation:title.reconciliation')} />
      <div className="ui-border ui-border-gray-300 ui-px-5 ui-py-3">
        <div className="ui-text-dark-teal ui-font-semibold">
          {t('reconciliationDetail:reconciliation_period.title')}
        </div>
        <div className="ui-mt-3 ui-flex ui-space-x-16">
          <div>
            <div className="ui-text-gray-700">
              {t('reconciliationDetail:reconciliation_period.from')}
            </div>
            <div className="ui-text-dark-teal ui-font-semibold">
              {parseDateTime(detail?.start_date ?? '', 'DD MMM YYYY')}
            </div>
          </div>
          <div>
            <div className="ui-text-gray-700">
              {t('reconciliationDetail:reconciliation_period.to')}
            </div>
            <div className="ui-text-dark-teal ui-font-semibold">
              {parseDateTime(detail?.end_date ?? '', 'DD MMM YYYY')}
            </div>
          </div>
        </div>
      </div>
      <div className="ui-border ui-border-gray-300 ui-px-5 ui-py-3 mt-5">
        <div className="ui-text-dark-teal ui-font-semibold">
          {t('reconciliationDetail:list.title')}
        </div>
        <div className="ui-mt-3">
          <DataTable
            data={detail?.reconciliation_items}
            columns={columsDetailReconciliation(t)}
            isLoading={isLoading}
          />
        </div>
        <div className="ui-flex ui-flex-row ui-justify-end ui-mt-5">
          <Button
            color="primary"
            variant="outline"
            onClick={() => router.back()}
            className="ui-min-w-28"
          >
            {t('common:back')}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export default ReconciliationDetailPage
