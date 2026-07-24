import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart } from '@repo/ui/components/chart'

import { TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import cx from '#lib/cx'

import { TDashboardTabs } from '../../dashboard.type'
import MicroplanningDashboardTable from '../schemas/dashboardMicroplanningListTable'
import { MicroplanningDashboardType } from '../dashboard-microplanning.constant'

/* ================= types ================= */

type ChartData = {
  labels: string[]
  datasets: {
    label: 'Target' | 'Consumption'
    data: number[]
    backgroundColor: string
  }[]
}

type Props<T extends string> = Readonly<{
  id: string
  title: string
  subtitle?: string

  tabList?: TDashboardTabs<T>[]
  setTab?: (tab: T) => void
  defaultActiveTab?: string

  name?: string
  columns?: any
  dataTable?: any
  pagination?: any
  filter?: any

  targetConsumptionAgeData?: ChartData
  targetConsumptionVaccinationData?: ChartData
}>

/* ================= component ================= */

export default function DashboardMicroplanningTargetConsumption<
  T extends string,
>({
  id,
  title,
  subtitle,
  tabList = [],
  setTab,
  defaultActiveTab,
  name,
  columns,
  dataTable = [],
  pagination,
  filter,
  targetConsumptionAgeData = { labels: [], datasets: [] },
  targetConsumptionVaccinationData = { labels: [], datasets: [] },
}: Props<T>) {
  const { t } = useTranslation('dashboardMicroplanning')

  /* ================= helpers ================= */

  const isTabDisabled = (id: string) => {
    if (!filter) return false

    switch (id) {
      case 'province':
        return false
      case 'city':
        return !filter.province?.length
      case 'district':
        return !filter.city?.length
      case 'village':
        return !filter['sub_district']?.length
      default:
        return false
    }
  }

  const getValidDefaultTab = () => {
    const firstEnabledTab = tabList.find(
      (tab) => !isTabDisabled(tab.id),
    )
    return firstEnabledTab?.id ?? tabList[0]?.id ?? ''
  }

  const getTabFromFilter = () => {
    if (!filter) return defaultActiveTab ?? getValidDefaultTab()

    if (filter.village?.length) return MicroplanningDashboardType.Village
    if (filter['sub_district']?.length) return MicroplanningDashboardType.Subdistrict
    if (filter.city?.length) return MicroplanningDashboardType.Regency

    return MicroplanningDashboardType.Province
  }

  /* ================= state ================= */

  const [activeTab, setActiveTab] = useState<string>(
    defaultActiveTab ?? getValidDefaultTab(),
  )

  const [appearanceMode, setAppearanceMode] = useState<
    'chart' | 'table'
  >('chart')

  const [visibleSeries, setVisibleSeries] = useState({
    Target: true,
    Consumption: true,
  })

  const toggleSeries = (key: 'Target' | 'Consumption') => {
    setVisibleSeries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /* ================= effects ================= */

  // sync tab from filter
  useEffect(() => {
    const nextTab = getTabFromFilter()
    if (!nextTab || nextTab === activeTab) return

    setActiveTab(nextTab)
    setTab?.(nextTab as T)
  }, [filter])

  // reset pagination on filter change
  useEffect(() => {
    if (pagination?.page !== 1) {
      pagination?.onChangePage?.(1)
    }
  }, [filter, activeTab])

  /* ================= chart data ================= */

  const mergedChartData = {
    labels: [
      ...targetConsumptionAgeData.labels,
      ...targetConsumptionVaccinationData.labels,
    ],
    datasets: [
      ...targetConsumptionAgeData.datasets.map((ds) => ({
        ...ds,
        data: [
          ...ds.data,
          ...Array(
            targetConsumptionVaccinationData.labels.length,
          ).fill(null),
        ],
      })),
      ...targetConsumptionVaccinationData.datasets.map((ds) => ({
        ...ds,
        data: [
          ...Array(targetConsumptionAgeData.labels.length).fill(
            null,
          ),
          ...ds.data,
        ],
      })),
    ],
  }

  const finalChartData = {
    ...mergedChartData,
    datasets: mergedChartData.datasets.filter(
      (ds) => visibleSeries[ds.label],
    ),
  }

  const colors = finalChartData.datasets.map(
    (ds) => ds.backgroundColor,
  )

  const colorMap = mergedChartData.datasets.reduce(
    (acc, ds) => ({
      ...acc,
      [ds.label]: ds.backgroundColor,
    }),
    {} as Record<'Target' | 'Consumption', string>,
  )

  const chartLabelMap = {
    Target: 'title.dashboard.chart.target',
    Consumption: 'title.dashboard.chart.consumption',
  } as const

  const chartMinWidth =
    finalChartData.labels.length *
    Math.max(
      80,
      Math.max(...finalChartData.labels.map((l) => l.length)) * 8,
    )


  /* ================= render ================= */

  return (
    <DashboardBox.Root id={id}>
      <DashboardBox.Header bordered>
        <div className="ui-flex ui-justify-between ui-items-center ui-w-full">
          <div className="ui-flex-1">
            <h4>{title}</h4>
            {subtitle && (
              <p
                className={cx(
                  'ui-text-base',
                  'ui-text-dark-teal',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Appearance Switch */}
          <div className="ui-text-start ui-flex-none ui-basis-2/8">
            <label className="ui-text-sm ui-font-medium ui-text-gray-600">
              {t('title.dashboard.appearance')}
            </label>
            <div className="ui-flex ui-gap-3 ui-mt-1">
              {(['chart', 'table'] as const).map((mode) => (
                <label
                  key={mode}
                  className="ui-flex ui-items-center ui-gap-1 ui-cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`appearance-${id}`}
                    value={mode}
                    checked={appearanceMode === mode}
                    onChange={() => setAppearanceMode(mode)}
                    className="ui-cursor-pointer ui-mt-1"
                  />
                  <span className="ui-text-base">
                    {mode === 'chart'
                      ? t('title.dashboard.chart.chart')
                      : t('title.dashboard.table')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </DashboardBox.Header>

      <div className="ui-relative ui-p-4 ui-bg-gray-50">
        <TabsRoot
          variant="pills"
          value={activeTab}
          align="stretch"
          onValueChange={(value) => {
            if (isTabDisabled(value)) return
            setActiveTab(value)
            setTab?.(value as T)
          }}
        >
          {/* Tabs */}
          <div className="ui-flex ui-items-center ui-gap-4 mb-5">
            <TabsList className="ui-grid-cols-4 ui-grow">
              {tabList.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  disabled={isTabDisabled(item.id)}
                  className="ui-justify-center ui-text-sm ui-px-2 ui-h-10"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          {appearanceMode === 'table' ? (
            <MicroplanningDashboardTable
              name={name}
              columns={columns}
              data={dataTable}
              pagination={pagination}
            />
          ) : (
            <div className="ui-w-full ui-h-[500px] ui-border-2 ui-rounded-xl ui-p-5 ui-flex ui-flex-col">
              <div className="ui-flex-1 ui-overflow-x-auto ui-overflow-y-hidden">
                <div
                  style={{
                    minWidth: chartMinWidth,
                    height: '100%',
                  }}
                >
                  <BarChart
                    layout="vertical"
                    data={finalChartData}
                    color={colors}
                    isDataFormatted={true}
                    labelColor="#0C3045"
                    formatValue={(val) => String(val)}
                    options={{
                      scales: {
                        x: {
                          grid: { color: '#E5E7EB' },
                          ticks: { color: '#0C3045' },
                        },
                        y: {
                          grid: { display: false },
                          ticks: { color: '#0C3045' },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* ===== TOGGLE ===== */}
              <div className="ui-flex ui-justify-center ui-gap-4 ui-mt-3 ui-text-sm ui-shrink-0">
                {(['Target', 'Consumption'] as const).map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSeries(key)}
                      className="ui-flex ui-items-center ui-gap-1 ui-bg-transparent ui-border-0"
                      style={{
                        opacity: visibleSeries[key] ? 1 : 0.4,
                      }}
                    >
                      <span
                        className="ui-w-3 ui-h-3 ui-rounded-sm"
                        style={{
                          background:
                            colorMap[key] ?? '#D1D5DB',
                        }}
                      />
                      {t(chartLabelMap[key])}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </TabsRoot>
      </div>
    </DashboardBox.Root>
  )
}
