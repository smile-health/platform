import { useQuery } from '@tanstack/react-query'
import { BarChart } from '#components/chart'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import { TBarChart } from '../../dashboard.type'
import { DashboardAsikTabType } from '../dashboard-asik.constant'
import { handleFilter } from '../dashboard-asik.helper'
import { getDashboardAsikReview } from '../dashboard-asik.service'
import { TDashboardAsikFilter } from '../dashboard-asik.type'

type Props = Readonly<{
  filter: TDashboardAsikFilter
  region: DashboardAsikTabType
  enabled?: boolean
}>

export default function DashboardAsikChart({
  filter,
  region,
  enabled = false,
}: Props) {
  const { t } = useTranslation('dashboardAsik')

  const params = handleFilter(filter)

  const {
    data: dataSource,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-asik-review', params, region],
    queryFn: () => getDashboardAsikReview({ ...params, region }),
    enabled: !!params?.from && !!params?.to && enabled,
  })

  const data = dataSource?.data?.map((item) => {
    return {
      y: item?.label,
      x: item?.value,
      extra: {
        tooltip: item?.tooltip,
      },
    }
  })

  const color = dataSource?.data?.[0]?.color

  return (
    <DashboardBox.Provider filter={filter} colorClass="ui-bg-white">
      <DashboardBox.Root id="dashboard-asik">
        <DashboardBox.Header size="small" bordered>
          {t('title.chart')}
        </DashboardBox.Header>
        <DashboardBox.Body>
          <DashboardBox.Config
            withRegionSection={false}
            download={{
              targetElementId: 'dashboard-asik',
              fileName: 'Dashboard Asik',
            }}
          />
          <DashboardBox.Content
            isLoading={isLoading || isFetching}
            isEmpty={!data?.length}
          >
            <BarChart
              color={color}
              labelColor="#404040"
              data={data || []}
              layout="horizontal"
              isDataFormatted={false}
              formatValue={(value) => `${value?.x}%`}
              tooltipFormatter={{
                label: (context) => {
                  const item = context?.raw as TBarChart

                  return item?.extra?.tooltip
                },
              }}
            />
          </DashboardBox.Content>
        </DashboardBox.Body>
      </DashboardBox.Root>
    </DashboardBox.Provider>
  )
}
