import { useEffect, useMemo, useState } from 'react'
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
import { OptionType, ReactSelect } from '#components/react-select'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { ChartData } from 'chart.js'
import { useTranslation } from 'react-i18next'

import DashboardBox from '../components/DashboardBox'
import DashboardFilter from '../components/DashboardFilter'
import DashboardTabs from '../components/DashboardTabs'
import {
  TRANSACTION_MONITORING_TAB_CONTENT,
  TRANSACTION_TYPE_COLOR_V2,
  transactionChartTabs,
  TransactionChartType,
  transactionDataElementTab,
  transactionTypeListV2,
  TransactionTypeV2,
} from './dashboard-transaction-monitoring.constant'
import useChartData from './hooks/useChartData'
import dashboardTransactionMonitoringFilterSchema from './schemas/dashboardTransactionMonitoringFilterSchema'
import DashboardTransactionMonitoringEntityTagChart from './sections/DashboardTransactionMonitoringEntityTagChart'
import DashboardTransactionMonitoringMonthChart from './sections/DashboardTransactionMonitoringMonthChart'

export default function DashboardTransactionMonitoringV2Page() {
  usePermission('dashboard-monitoring-transaction-view')

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardMonitoringTransactions')

  const { t: tDashboard } = useTranslation('dashboard')

  const [openInformation, setOpenInformation] = useState(false)
  const [tab, setTab] = useState<TransactionChartType>(
    TransactionChartType.Total
  )
  const [transactionType, setTransactionType] = useState<OptionType>({
    label: t('data.transaction_type.consumption'),
    value: TransactionTypeV2.Consumption,
  })

  const transactionTypeList: OptionType[] = transactionTypeListV2(t)

  const filterSchema = useMemo<UseFilter>(
    () =>
      dashboardTransactionMonitoringFilterSchema(t, tDashboard, language, true),
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)

  const { chart, isLoading, onExport } = useChartData({
    ...filter?.query,
    transaction_type: filter?.query?.period?.start
      ? transactionType?.value
      : null,
  })

  const color =
    TRANSACTION_TYPE_COLOR_V2[transactionType?.value as TransactionTypeV2]
  const isDiscard = transactionType?.value === TransactionTypeV2.Discards
  const elementTab = transactionDataElementTab(
    t,
    filter?.query?.informationType
  )?.[tab]

  const informations = t('description.page', { returnObjects: true })

  useEffect(() => {
    setTransactionType((prev) => {
      const newData = transactionTypeList.find(
        (item) => item.value === prev.value
      )
      return {
        ...prev,
        ...newData,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

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
        colorClass="ui-bg-gray-100"
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

        <DashboardTransactionMonitoringEntityTagChart
          isLoading={isLoading}
          data={chart?.byEntityTag as ChartData<'bar', number[]>}
        />

        <DashboardTransactionMonitoringMonthChart
          isLoading={isLoading}
          labels={chart?.byMonth?.labels}
          series={chart?.byMonth?.series}
        />

        <DashboardTabs<TransactionChartType>
          id="dashboard-transaction-monitoring-tab"
          tabList={transactionChartTabs(t, isDiscard)}
          setTab={setTab}
          isNewLayout
          title={t('title.transaction_by_type', {
            type: transactionType?.label,
            section: elementTab?.title,
          })}
          subtitle={elementTab?.subtitle}
          defaultActiveTab={TransactionChartType.Total}
          gridSize={isDiscard ? 7 : 6}
          additionalContent={
            <ReactSelect
              value={transactionType}
              onChange={setTransactionType}
              options={transactionTypeList}
              className="ui-w-40"
            />
          }
          renderChild={(item) => {
            const Component = TRANSACTION_MONITORING_TAB_CONTENT[item?.id]
            return (
              <Component
                id={['active-filter', 'dashboard-transaction-monitoring-tab']}
                isRemoveContainerHeight
                filter={{
                  ...filter?.query,
                  transaction_type: filter?.query?.period?.start
                    ? transactionType?.value
                    : null,
                }}
                color={color}
                tab={item?.id}
                type="transaction"
                exportFileName={elementTab?.exportFileName}
                bordered
                rounded
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
