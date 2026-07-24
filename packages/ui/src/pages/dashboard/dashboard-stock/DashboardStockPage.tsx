import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import cx from '#lib/cx'
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
  ChartColor,
  InformationType,
  STOCK_TAB_CONTENT,
  stockChartTabs,
  StockChartType,
  stockDataElementTab,
} from './dashboard-stock.constant'
import dashboardStockFilterSchema from './schemas/dashboardStockFilterSchema'
import DashboardStockMaterialChart from './sections/DashboardStockMaterialChart'

export default function DashboardStockPage() {
  usePermission('dashboard-stock-view')
  const router = useRouter()

  const [tab, setTab] = useState<StockChartType>(StockChartType.Province)

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardStock')

  const { t: tDashboard } = useTranslation('dashboard')

  const filterSchema = useMemo<UseFilter>(
    () => dashboardStockFilterSchema(t, tDashboard, language, router.query),
    [t, tDashboard, language, router.query]
  )

  const filter = useFilter(filterSchema)

  const { chart, isLoading, onExport } = useGetChart(filter?.query, 'stock')

  const isInTransitStock =
    filter?.query?.informationType === InformationType.In_Transit_Stock
  const colorChart = isInTransitStock ? ChartColor.Yellow : ChartColor.Green
  const materialLevelLabel = filter?.query?.material_level?.label
  const elementTab = stockDataElementTab(
    t,
    isInTransitStock,
    materialLevelLabel
  )?.[tab]

  return (
    <Container title={t('title.page')} withLayout>
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardBox.Provider
        filter={filter?.query}
        onDownloadAsCSV={onExport}
        colorClass={cx({
          'ui-bg-green-500 ui-text-white': !isInTransitStock,
          'ui-bg-yellow-500 ui-text-dark-blue': isInTransitStock,
        })}
      >
        <DashboardFilter filter={filter} onExport={onExport} />
        <div className="ui-grid ui-gap-x-4 ui-gap-y-6 ui-grid-cols-7">
          <DashboardBigNumberSummarize
            id="dashboard-stock-number"
            value={chart?.number}
            isLoading={isLoading}
            title={t('title.stock.number')}
            subtitle={`Level KFA Material: ${materialLevelLabel}`}
            exportFileName="Dashboard Stock - By Number"
          />
          <DashboardEntityTagChart
            id="dashboard-stock-entity-tag"
            data={chart?.entityTag}
            isLoading={isLoading}
            color={colorChart}
            title={t('title.stock.by', { title: t('title.entity.tag') })}
            subtitle={`Level KFA Material: ${materialLevelLabel}`}
            exportFileName="Dashboard Stock - By Entity Tag"
          />
        </div>
        <DashboardStockMaterialChart
          data={chart?.material}
          isLoading={isLoading}
          color={colorChart}
          materialLevelLabel={materialLevelLabel}
        />
        {!isInTransitStock && (
          <DashboardLineChart
            id="dashboard-stock-expired-date"
            data={chart?.expiredMonth}
            isLoading={isLoading}
            color={colorChart}
            title={t('title.stock.by', { title: t('title.expired_date') })}
            subtitle={`Level KFA Material: ${materialLevelLabel}`}
            exportFileName="Dashboard Stock - By Expired Date"
          />
        )}
        <DashboardLineChart
          id="dashboard-stock-month"
          data={chart?.month}
          isLoading={isLoading}
          color={colorChart}
          title={t('title.stock.month')}
          subtitle={`Level KFA Material: ${materialLevelLabel}`}
          exportFileName="Dashboard Stock - Closing Stock per Batch"
          information={{
            show: !isInTransitStock,
            title: t('title.stock.month'),
            description: t('description.information_month'),
          }}
        />
        <DashboardTabs<StockChartType>
          id="dashboard-stock-tab"
          tabList={stockChartTabs(t)}
          setTab={setTab}
          title={t('title.stock.by', { title: elementTab?.title })}
          subtitle={elementTab?.subtitle}
          defaultActiveTab={StockChartType.Province}
          renderChild={(item) => {
            const Component = STOCK_TAB_CONTENT[item?.id]
            return (
              <Component
                id="dashboard-stock-tab"
                filter={filter?.query}
                color={colorChart}
                tab={item?.id}
                type="stock"
                exportFileName={elementTab?.exportFileName}
                sortPlaceholder={t('title.sort_by', {
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
