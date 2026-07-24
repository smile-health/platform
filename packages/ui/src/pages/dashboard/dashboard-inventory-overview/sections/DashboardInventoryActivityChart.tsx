import React, { useEffect, useRef } from 'react'
import { H5 } from '#components/heading'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { parseDateTime } from '#utils/date'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'

import DashoardInventoryOverviewInformation from '../components/DashoardInventoryOverviewInformation'
import {
  DashboardInventoryOverviewColorHEX,
  DashboardInventoryType,
} from '../dashboard-inventory-overview.constant'
import { TDashboardInventoryOverviewFilter } from '../dashboard-inventory-overview.type'
import useActivityStatus from '../hooks/useActivityStatus'

echarts.use([BarChart, TooltipComponent, GridComponent, CanvasRenderer])

type Props = {
  filter: TDashboardInventoryOverviewFilter
}

export default function DashboardInventoryActivityChart({
  filter,
}: Readonly<Props>) {
  const { t } = useTranslation('dashboardInventoryOverview')

  const chartRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<echarts.EChartsType>()

  const title = t('title.activity')

  const { data, isLoading, handleClick, axisName, lastUpdated } =
    useActivityStatus({ title, filter })

  useEffect(() => {
    if (chartRef.current && !instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const chart = instanceRef.current
    if (!chart) return

    const chartSeries =
      data?.map((item) => ({
        type: 'bar',
        stack: 'total',
        itemStyle: {
          color:
            item.type === DashboardInventoryType.Active
              ? DashboardInventoryOverviewColorHEX.Green
              : DashboardInventoryOverviewColorHEX.Red,
        },
        barWidth: 30,
        data: [
          {
            name: item?.name,
            value: item?.percent,
            type: item?.type,
            tooltip: {
              formatter: item?.tooltip,
            },
          },
        ],
      })) ?? []

    const chartOption = {
      tooltip: {
        trigger: 'item',
        position: (point: number[]) => [point[0], point[1] - 25],
      },
      grid: {
        left: 50,
        right: 50,
        top: 25,
        bottom: 0,
      },
      xAxis: {
        type: 'value',
        show: false,
        max: 100,
      },
      yAxis: {
        type: 'category',
        axisTick: { show: false },
        axisLabel: { show: false },
        axisLine: { show: false },
      },
      series: chartSeries,
    }

    chart.setOption(chartOption)

    const handleChartClick = (params: any) => {
      if (params?.data) handleClick(params.data)
    }

    chart.off('click')
    chart.on('click', handleChartClick)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.off('click', handleChartClick)
      chart.dispose()
      instanceRef.current = undefined
    }
  }, [data, handleClick])

  return (
    <DashboardBox.Root id="activity-entities">
      <DashboardBox.Header
        bordered
        className="ui-flex ui-items-center ui-justify-center ui-space-y-0"
      >
        <H5>{title}</H5>
        <DashboardBox.InfoModal title={title}>
          <DashoardInventoryOverviewInformation
            description={t('information.activity.description')}
            details={t('information.activity.detail', { returnObjects: true })}
          />
        </DashboardBox.InfoModal>
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Content
          isLoading={isLoading}
          isEmpty={!data?.length || data?.every((item) => !item?.percent)}
        >
          <div className="ui-flex ui-flex-col ui-items-center">
            <div ref={chartRef} style={{ height: 60, width: '100%' }} />
            <span className="ui-text-sm ui-text-neutral-500 ui-mt-1 ui-mb-4">
              {axisName}
            </span>
            <p className="ui-text-sm ui-text-center">
              {t('last_updated')} {parseDateTime(lastUpdated)}
            </p>
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
