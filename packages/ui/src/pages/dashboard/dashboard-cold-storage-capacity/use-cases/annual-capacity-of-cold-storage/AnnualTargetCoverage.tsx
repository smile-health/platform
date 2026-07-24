import { StackedBarChart } from '#components/chart'
import { numberFormatter } from '#utils/formatter'
import { ChartData, ChartOptions } from 'chart.js'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import DashboardColdStorageCapacityBox from '../../components/DashboardColdStorageCapacityBox'
import { useDashboardColdStorageCapacity } from '../../DashboardColdStorageCapacityContext'

const CATEGORY_COLORS = {
  achievement: '#22C55E',
  annual_target: '#9CA3AF',
}

const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf']

export default function AnnualTargetCoverage() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardColdStorageCapacity')

  const { annual } = useDashboardColdStorageCapacity()

  const unit = t('section.annual_target_coverage.unit')

  const data = {
    achievement: annual?.data?.annual_target_achievement.achievement || 0,
    annualTarget: annual?.data?.annual_target_achievement.need || 0,
  }

  const chartData: ChartData<'bar'> = {
    labels: [''],
    datasets: [
      {
        label: t('section.annual_target_coverage.category.achievement'),
        data: [data.achievement],
        backgroundColor: CATEGORY_COLORS.achievement,
      },
      {
        label: t('section.annual_target_coverage.category.annual_target'),
        data: [data.annualTarget],
        backgroundColor: CATEGORY_COLORS.annual_target,
      },
    ],
  }

  const total = Math.round((data.achievement + data.annualTarget) * 100) / 100

  const chartOptions: ChartOptions<'bar'> = {
    layout: {
      padding: {
        left: 30,
      },
    },
    scales: {
      x: {
        max: total,
        ticks: {
          callback: (value) => numberFormatter(Number(value), language),
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
            const value = context.raw as number
            return `${context.dataset.label}: ${numberFormatter(value, language)} ${unit}`
          },
        },
      },
      datalabels: {
        formatter: (value) =>
          `${numberFormatter(value as number, language)} ${unit}`,
      },
    },
  }

  return (
    <DashboardColdStorageCapacityBox
      id="annual-target-coverage"
      title={t('section.annual_target_coverage.title')}
      info={
        <p
          dangerouslySetInnerHTML={{
            __html: t('section.annual_target_coverage.info'),
          }}
        />
      }
      lastUpdated={annual?.data?.annual_target_achievement?.last_update}
      downloadExtensions={DOWNLOAD_EXTENSIONS}
      isLoading={annual?.isLoading}
      isEmpty={!data.achievement && !data.annualTarget}
    >
      <div className="ui-w-full ui-h-[200px]">
        <StackedBarChart
          data={chartData}
          layout="horizontal"
          isShortedNumber={false}
          enableScroll
          maxHeight={200}
          options={chartOptions}
        />
      </div>
    </DashboardColdStorageCapacityBox>
  )
}
