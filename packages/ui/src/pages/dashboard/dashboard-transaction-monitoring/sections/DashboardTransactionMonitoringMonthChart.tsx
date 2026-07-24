import { StackedLineChart } from '#components/chart'
import cx from '#lib/cx'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import { LineSeriesOption } from 'echarts/charts'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  isLoading?: boolean
  labels?: string[]
  series?: LineSeriesOption[]
}>

export default function DashboardTransactionMonitoringMonthChart({
  isLoading,
  labels = [],
  series = [],
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardMonitoringTransactions')

  const isUseSlider = labels?.length > 8

  return (
    <DashboardBox.Root id="dashboard-transaction-monitoring-month">
      <DashboardBox.Header bordered>
        {t('title.transaction_by', {
          section: t('title.month'),
        })}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: [
              'active-filter',
              'dashboard-transaction-monitoring-month',
            ],
            fileName: 'Dashboard Transaction Monitoring - By Month',
          }}
        />
        <DashboardBox.Content isLoading={isLoading} isEmpty={!series?.length}>
          <div className="ui-h-96">
            <StackedLineChart
              labels={labels}
              series={series}
              maxVisible={8}
              options={{
                tooltip: {
                  trigger: 'axis',
                  formatter: undefined,
                },
                legend: {
                  bottom: isUseSlider ? 50 : 0,
                  icon: 'circle',
                  textStyle: {
                    fontSize: 14,
                  },
                },
                grid: {
                  bottom: isUseSlider ? 90 : 50,
                },
                yAxis: {
                  axisLabel: {
                    formatter: (value: number) =>
                      numberFormatter(value, language),
                  },
                },
              }}
              className="ui-text-start"
            />
          </div>
          <div
            className={cx('ui-flex ui-items-center ui-gap-4', {
              'ui-justify-center ui-mt-1': !isUseSlider,
              'ui-absolute ui-left-1/2 -ui-translate-x-1/2 ui-bottom-10':
                isUseSlider,
            })}
          >
            <div className="ui-flex ui-items-center ui-gap-1">
              <span>{'\u2015'}</span>
              <span className="ui-text-sm">End-Point Transactions</span>
            </div>
            <div className="ui-flex ui-items-center ui-gap-1">
              <span>- - -</span>
              <span className="ui-text-sm">Order Related Transactions</span>
            </div>
          </div>
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
