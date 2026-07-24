import { useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import DashboardFilter from '../components/DashboardFilter'
import usePagination from '../hooks/usePagination'
import DashboardStockTakingDataDisplay from './components/DashboardStockTakingDataDisplay'
import DashboardStockTakingInformation from './components/DashboardStockTakingInformation'
import {
  getStockTakingDashboardTabs,
  StockTakingType,
} from './dashboard-stock-taking.constant'
import useStockTakingDashboardData from './hooks/useStockTakingDashboardData'
import dashboardStockTakingFilterSchema from './schemas/dashboardStockTakingFilterSchema'

export default function DashboardStockTakingPage() {
  usePermission('dashboard-stock-taking-view')
  const queryClient = useQueryClient()

  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardStockTaking')

  const { t: tDashboard } = useTranslation('dashboard')

  const {
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    handleResetPagination,
  } = usePagination()

  const [openInformation, setOpenInformation] = useState(false)
  const [tab, setTab] = useState<StockTakingType>(StockTakingType.Entity)

  const filterSchema = useMemo<UseFilter>(
    () => dashboardStockTakingFilterSchema(t, tDashboard, language),
    [t, tDashboard, language]
  )

  const filter = useFilter(filterSchema)
  const tabs = getStockTakingDashboardTabs(t)

  const [
    getData,
    { isLoading, isLoadingSummary, table, summary, columns, onExport },
  ] = useStockTakingDashboardData({
    tab,
    filter: filter?.query,
    page,
    paginate,
  })

  useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['compliance'] })
      queryClient.removeQueries({ queryKey: ['compliance-summary'] })
      queryClient.removeQueries({ queryKey: ['result'] })
      queryClient.removeQueries({ queryKey: ['result-summary'] })
      queryClient.removeQueries({ queryKey: ['material'] })
    }
  }, [])

  return (
    <Container
      title={t('title.page')}
      showInformation
      withLayout
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={generateMetaTitle(t('title.page'))} />
      <DashboardStockTakingInformation
        open={openInformation}
        setOpen={setOpenInformation}
      />
      <div className="ui-space-y-6">
        <DashboardFilter
          filter={filter}
          isValidatingRequiredField
          isUseDisabledExport
          onExport={onExport}
          onSubmit={() => {
            handleChangePage(1)
            getData()
          }}
        />
        <TabsRoot variant="pills" align="stretch" defaultValue="entity">
          <TabsList className="ui-grid-cols-3 ui-mb-3">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                buttonClassName="ui-justify-center"
                onClick={() => {
                  setTab(item.id)
                  handleResetPagination()
                }}
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((item) => {
            return (
              <TabsContent key={item.id} value={item.id}>
                <DashboardStockTakingDataDisplay
                  tab={item.id}
                  page={page}
                  paginate={paginate}
                  isLoading={isLoading}
                  isLoadingSummary={isLoadingSummary}
                  table={table}
                  summary={summary}
                  handleChangePage={(page) => {
                    handleChangePage(page)
                    getData(page)
                  }}
                  handleChangePaginate={(paginate) => {
                    handleChangePaginate(paginate)
                    getData(paginate)
                  }}
                  columns={columns ?? []}
                />
              </TabsContent>
            )
          })}
        </TabsRoot>
      </div>
    </Container>
  )
}
