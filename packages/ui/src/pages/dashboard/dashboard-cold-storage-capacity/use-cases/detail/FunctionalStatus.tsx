import { useCallback, useMemo, useRef, useState } from 'react'
import { StackedBarChart } from '#components/chart'
import {
  TooltipContent,
  TooltipRoot,
  TooltipTrigger,
} from '#components/tooltip'
import { numberFormatter } from '#utils/formatter'
import { ChartData, ChartOptions, Plugin } from 'chart.js'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useExportCceFunctionStatusQuery } from '../../dashboard-cold-storage-capacity.queries'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'
import { DashboardColdStorageCapacityFilterParams } from '../filter/useDashboardColdStorageCapacityFilterSchema.types'

const FUNCTIONAL_STATUS_COLORS = {
  standby: '#1B4B8F',
  well_functioning: '#22C55E',
  need_repair: '#F59E0B',
  broken: '#EF4444',
  under_repair: '#9CA3AF',
}

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf', 'csv']

type IconPosition = { x: number; y: number; index: number }

export default function FunctionalStatus() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { detail, filter } = useDashboardColdStorageCapacity()
  const filterValues = useMemo(
    () => filter.getValues() as DashboardColdStorageCapacityFilterParams,
    [filter]
  )
  const { refetch: exportCSV } = useExportCceFunctionStatusQuery(
    filterValues,
    detail.isPqs
  )

  const nullTempIndices = useMemo(() => {
    const indices = new Set<number>()
    detail?.data?.function_status?.data?.forEach((item, index) => {
      if (item.temp_min == null || item.temp_max == null) {
        indices.add(index)
      }
    })
    return indices
  }, [detail?.data?.function_status?.data])

  const [iconPositions, setIconPositions] = useState<IconPosition[]>([])
  const prevPositionsRef = useRef<string>('')

  const updatePositions = useCallback(
    (positions: IconPosition[]) => {
      const key = JSON.stringify(positions)
      if (key !== prevPositionsRef.current) {
        prevPositionsRef.current = key
        setIconPositions(positions)
      }
    },
    [setIconPositions]
  )

  const positionTrackerPlugin: Plugin<'bar'> = useMemo(
    () => ({
      id: 'infoIconPositionTracker',
      afterDraw(chart) {
        const yScale = chart.scales.y
        if (!yScale || nullTempIndices.size === 0) {
          updatePositions([])
          return
        }

        const dpr = chart.currentDevicePixelRatio
        const positions: IconPosition[] = []

        nullTempIndices.forEach((idx) => {
          const yPixel = yScale.getPixelForTick(idx)
          const xPixel = yScale.left

          positions.push({
            x: xPixel / dpr + 20,
            y: yPixel / dpr + 10,
            index: idx,
          })
        })

        updatePositions(positions)
      },
    }),
    [nullTempIndices, updatePositions]
  )

  const data = {
    labels:
      detail?.data?.function_status?.data?.map((item) => [
        item.type_name,
        `(${item.temp_min ?? '-'}°C ${t('section.remaining_capacity.to')} ${item.temp_max ?? '-'}°C)`,
      ]) || [],
    standby:
      detail?.data?.function_status?.data?.map(
        (item) => item.total_standby_percentage || 0
      ) || [],
    wellFunctioning:
      detail?.data?.function_status?.data?.map(
        (item) => item.total_well_functioning_percentage || 0
      ) || [],
    needRepair:
      detail?.data?.function_status?.data?.map(
        (item) => item.total_functioning_need_repair_percentage || 0
      ) || [],
    broken:
      detail?.data?.function_status?.data?.map(
        (item) => item.total_not_functioning_percentage || 0
      ) || [],
    underRepair:
      detail?.data?.function_status?.data?.map(
        (item) => item.total_commisioning_issue_percentage || 0
      ) || [],
    entities: {
      wellFunctioning:
        detail?.data?.function_status?.data?.map(
          (item) => item.total_well_functioning || 0
        ) || [],
      standby:
        detail?.data?.function_status?.data?.map(
          (item) => item.total_standby || 0
        ) || [],
      needRepair:
        detail?.data?.function_status?.data?.map(
          (item) => item.total_functioning_need_repair || 0
        ) || [],
      underRepair:
        detail?.data?.function_status?.data?.map(
          (item) => item.total_commisioning_issue || 0
        ) || [],
      broken:
        detail?.data?.function_status?.data?.map(
          (item) => item.total_not_functioning || 0
        ) || [],
    },
  }

  const handleDownloadCSV = () => {
    exportCSV()
  }

  const chartData: ChartData<'bar'> = {
    labels: data.labels,
    datasets: [
      {
        label: t('section.functional_status.category.well_functioning'),
        data: data.wellFunctioning,
        backgroundColor: FUNCTIONAL_STATUS_COLORS.well_functioning,
      },
      {
        label: t('section.functional_status.category.standby'),
        data: data.standby,
        backgroundColor: FUNCTIONAL_STATUS_COLORS.standby,
      },
      {
        label: t('section.functional_status.category.need_repair'),
        data: data.needRepair,
        backgroundColor: FUNCTIONAL_STATUS_COLORS.need_repair,
      },
      {
        label: t('section.functional_status.category.under_repair'),
        data: data.underRepair,
        backgroundColor: FUNCTIONAL_STATUS_COLORS.under_repair,
      },
      {
        label: t('section.functional_status.category.broken'),
        data: data.broken,
        backgroundColor: FUNCTIONAL_STATUS_COLORS.broken,
      },
    ],
  }

  const chartOptions: ChartOptions<'bar'> = {
    scales: {
      x: {
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percentage = context.raw as number
            const entityKeys = [
              'wellFunctioning',
              'standby',
              'needRepair',
              'underRepair',
              'broken',
            ] as const
            const key = entityKeys[context.datasetIndex]
            const entityCount = data.entities[key]?.[context.dataIndex] ?? 0
            return `${context.dataset.label}: ${percentage}% (${numberFormatter(entityCount, language)} ${t('section.functional_status.assets')})`
          },
        },
      },
      datalabels: {
        display: (context) => {
          const value = context.dataset.data[context.dataIndex] as number
          if (!value) return false
          const nonZeroCount = context.chart.data.datasets.filter(
            (ds) => (ds.data?.[context.dataIndex] as number) > 0
          ).length
          if (nonZeroCount <= 1) return true
          return value >= 5
        },
        anchor: (context) => {
          const nonZeroCount = context.chart.data.datasets.filter(
            (ds) => (ds.data?.[context.dataIndex] as number) > 0
          ).length
          const value = context.dataset.data[context.dataIndex] as number
          return nonZeroCount <= 1 && value < 5 ? 'end' : 'center'
        },
        align: (context) => {
          const nonZeroCount = context.chart.data.datasets.filter(
            (ds) => (ds.data?.[context.dataIndex] as number) > 0
          ).length
          const value = context.dataset.data[context.dataIndex] as number
          return nonZeroCount <= 1 && value < 5 ? 'end' : 'center'
        },
        color: (context) => {
          if (context.datasetIndex === 1) return '#FFFFFF'
          const nonZeroCount = context.chart.data.datasets.filter(
            (ds) => (ds.data?.[context.dataIndex] as number) > 0
          ).length
          const value = context.dataset.data[context.dataIndex] as number
          return nonZeroCount <= 1 && value < 5 ? '#404040' : '#000000'
        },
      },
    },
  }

  return (
    <DashboardColdStorageCapacityBox
      id="functional-status"
      title={t('section.functional_status.title')}
      info={<p>{t('section.functional_status.info')}</p>}
      lastUpdated={detail?.data?.function_status?.last_updated}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      onDownloadCSV={handleDownloadCSV}
      isLoading={detail.isLoading}
      isEmpty={!detail.data?.function_status?.data?.length}
    >
      <div className="ui-relative ui-w-full">
        <StackedBarChart
          data={chartData}
          layout="horizontal"
          isPercentage
          isShortedNumber={false}
          height={(data.labels.length || 1) * 60 + 90}
          options={chartOptions}
          plugins={[positionTrackerPlugin]}
        />
        {iconPositions.map((pos) => (
          <div
            key={pos.index}
            className="ui-absolute"
            style={{
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <TooltipRoot delayDuration={0}>
              <TooltipTrigger>
                <button
                  type="button"
                  className="ui-flex ui-h-4 ui-w-4 ui-items-center ui-justify-center ui-rounded-full ui-bg-gray-400 ui-text-[10px] ui-font-bold ui-leading-none ui-text-white hover:ui-bg-gray-500"
                >
                  i
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                style={{ zIndex: 999, maxWidth: 250 }}
              >
                <p className="ui-text-sm">
                  {t('section.functional_status.temp_not_set_info')}
                </p>
              </TooltipContent>
            </TooltipRoot>
          </div>
        ))}
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
