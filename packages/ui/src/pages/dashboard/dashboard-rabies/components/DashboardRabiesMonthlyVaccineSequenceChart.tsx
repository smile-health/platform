import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StackedLineChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useTranslation } from 'react-i18next'

import { VACCINE_SEQUENCE_COLORS } from '../dashboard-rabies.constant'
import { getMonthlyVaccineSequence } from '../dashboard-rabies.service'
import {
  DashboardRabiesWithAdditionalParams,
  RabiesSequenceSeries,
} from '../dashboard-rabies.type'
import { useBreakpoint } from '#hooks/useMediaQuery'

export type Props = Readonly<{
  enabled?: boolean
  params: DashboardRabiesWithAdditionalParams
}>

export default function DashboardRabiesMonthlyVaccineSequenceChart({
  enabled,
  params,
}: Props) {
  const {
    i18n: { language },
  } = useTranslation('dashboardRabies')
  const {
    isMobile,
    isTablet,
  } = useBreakpoint()

  const bottom = useMemo(() => {
    if (isMobile) return 120
    if (isTablet) return 90
    return 60
  }, [isMobile, isTablet])

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['rabies-monthly-vaccine-sequence', params, language],
    queryFn: () => getMonthlyVaccineSequence(params),
    enabled,
  })

  const labels = dataSource?.data?.map((item) => {
    return dayjs(`${item?.year}-${item?.month}`).format('MMM YYYY')
  })

  const seriesObject = dataSource?.data?.reduce(
    (acc, item) => {
      item.values.forEach((vaccine, idx) => {
        if (!acc[vaccine.title]) {
          acc[vaccine.title] = {
            name: vaccine.title,
            data: [],
            color: VACCINE_SEQUENCE_COLORS[idx],
            label: {
              show: true,
              formatter: (params: CallbackDataParams) => {
                const value = Number(params?.value ?? 0)
                return numberFormatter(value, language)
              },
            },
          }
        }
        acc[vaccine.title].data.push(vaccine.value)
      })
      return acc
    },
    {} as Record<string, RabiesSequenceSeries>
  )

  const series = Object.values(seriesObject ?? {})

  return (
    <div className="ui-space-y-4">
      <DashboardBox.Content
        className="ui-h-96"
        isEmpty={!dataSource?.data?.length}
        isLoading={isLoading || isFetching}
      >
        <StackedLineChart
          labels={labels ?? []}
          series={series ?? []}
          options={{
            tooltip: {
              trigger: 'axis',
              formatter: undefined,
            },
            grid: { bottom },
          }}
          className="ui-text-start"
        />
      </DashboardBox.Content>
    </div>
  )
}
