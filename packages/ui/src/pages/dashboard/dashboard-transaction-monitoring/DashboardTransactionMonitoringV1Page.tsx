import { useMemo, useState } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useFilter, UseFilter } from '#components/filter'
import { H5 } from '#components/heading'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardBigNumberSummarize from '../components/DashboardBigNumberSummarize'
import DashboardBox from '../components/DashboardBox'
import DashboardEntityTagChart from '../components/DashboardEntityTagChart'
import DashboardFilter from '../components/DashboardFilter'
import DashboardLineChart from '../components/DashboardLineChart'
import DashboardTabs from '../components/DashboardTabs'
import useGetChart from '../hooks/useGetChart'
import {
  TRANSACTION_MONITORING_TAB_CONTENT,
  TRANSACTION_TYPE_COLOR,
  transactionChartTabs,
  TransactionChartType,
  transactionDataElementTab,
  TransactionType,
} from './dashboard-transaction-monitoring.constant'
import dashboardTransactionMonitoringFilterSchema from './schemas/dashboardTransactionMonitoringFilterSchema'

export default function DashboardTransactionMonitoringV1Page() {
  usePermission('dashboard-monitoring-transaction-view')
  const [openInformation, setOpenInformation] = useState(false)
  const [tab, setTab] = useState<TransactionChartType>(
    TransactionChartType.Material
  )

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardMonitoringTransactions')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => dashboardTransactionMonitoringFilterSchema(t, tDashboard, language),
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)

  const { chart, isLoading, onExport } = useGetChart(
    filter?.query,
    'transaction'
  )

  const transactionType = filter?.query?.transaction_type
  const color =
    TRANSACTION_TYPE_COLOR[transactionType?.value as TransactionType]
  const isDiscard = transactionType?.value === TransactionType.Discards
  const elementTab = transactionDataElementTab(
    t,
    filter?.query?.informationType
  )?.[tab]

  const informations = t('description.page', { returnObjects: true })

  return (
    <Container
      title={t('title.page')}
      withLayout
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardBox.Provider
        filter={filter?.query}
        colorClass={color?.className}
        onDownloadAsCSV={onExport}
      >
        <Dialog
          open={openInformation}
          onOpenChange={setOpenInformation}
          className="ui-z-20"
          scrollBehavior="inside"
        >
          <DialogHeader className="ui-text-center">
            {t('title.page')}
          </DialogHeader>
          <DialogContent className="ui-space-y-3">
            {informations?.map((info) => (
              <div key={info?.title}>
                <H5>{info?.title}</H5>
                <p>{info?.description}</p>
              </div>
            ))}
          </DialogContent>
          <DialogFooter className="ui-grid ui-grid-cols-1">
            <Button variant="outline" onClick={() => setOpenInformation(!open)}>
              {tDashboard('close')}
            </Button>
          </DialogFooter>
        </Dialog>
        <DashboardFilter filter={filter} onExport={onExport} />
        <div className="ui-grid ui-gap-x-4 ui-gap-y-6 ui-grid-cols-7">
          <DashboardBigNumberSummarize
            id="dashboard-transaction-monitoring-number"
            value={chart?.number}
            isLoading={isLoading}
            exportFileName="Dashboard Transaction Monitoring - By Number"
            title={t('title.number', {
              type: transactionType?.label,
            })}
          />
          <DashboardEntityTagChart
            id="dashboard-transaction-monitoring-entity-tag"
            data={chart?.entityTag}
            isLoading={isLoading}
            color={color?.chart}
            exportFileName="Dashboard Transaction Monitoring - By Entity Tag"
            title={t('title.by', {
              type: transactionType?.label,
              title: t('title.entity.tag'),
            })}
          />
        </div>
        <DashboardLineChart
          id="dashboard-transaction-monitoring-month"
          data={chart?.month}
          isLoading={isLoading}
          color={color?.chart}
          exportFileName="Dashboard Transaction Monitoring - By Month"
          title={t('title.by', {
            type: transactionType?.label,
            title: t('title.month'),
          })}
        />
        <DashboardTabs<TransactionChartType>
          id="dashboard-transaction-monitoring-tab"
          tabList={transactionChartTabs(t, isDiscard)}
          setTab={setTab}
          title={t('title.by', {
            type: transactionType?.label,
            title: elementTab?.title,
          })}
          subtitle={elementTab?.subtitle}
          defaultActiveTab={TransactionChartType.Material}
          gridSize={isDiscard ? 6 : 5}
          renderChild={(item) => {
            const Component = TRANSACTION_MONITORING_TAB_CONTENT[item?.id]
            return (
              <Component
                id="dashboard-transaction-monitoring-tab"
                filter={filter?.query}
                color={color?.chart}
                tab={item?.id}
                type="transaction"
                exportFileName={elementTab?.exportFileName}
                sortPlaceholder={t('title.sort.id', {
                  type: elementTab?.title?.toLowerCase(),
                })}
              />
            )
          }}
        />
      </DashboardBox.Provider>
    </Container>
  )
}
