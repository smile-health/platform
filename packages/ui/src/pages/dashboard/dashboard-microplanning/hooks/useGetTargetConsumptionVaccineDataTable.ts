import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { handleMicroplanningFilter } from '../../dashboard.helper'
import {
  tableTargetConsumptionVaccineColumns,
  MicroplanningDashboardType,
} from '../dashboard-microplanning.constant'
import { getDataTargetConsumptionVaccination } from '../dashboard-microplanning.service'

export default function useGetTargetConsumptionVaccineDataTable<T extends MicroplanningDashboardType>(
  filter: Values<Record<string, any>>,
  tab: T,
  submitKey: number
) {
  const {
    t
  } = useTranslation('dashboardMicroplanning')

  const [pagination, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { page, paginate } = pagination

  const finalFilter = handleMicroplanningFilter({ ...filter })
  const params = { ...finalFilter, page, paginate }

  const {
    data: targetConsumptionData,
    isLoading: isTargetConsumptionLoading,
    isFetching: isTargetConsumptionFetching,
  } = useQuery({
    queryKey: ['total-target-vaccine', params, tab, submitKey],
    queryFn: () => getDataTargetConsumptionVaccination(params, tab),
  })

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  const vaccineColumns =
    targetConsumptionData?.data
      ? Object.keys(targetConsumptionData.data[0]?.details?.target || {}).map(key => ({
        header: key,
        accessorKey: key.replace(/-/g, "_"),
      }))
      : []

  const rows =
    targetConsumptionData?.data
      ? targetConsumptionData.data.flatMap((item: any) => {
        const ageKeys = Object.keys(item.details.target)

        const targetRow: any = {
          region: item.region,
          type: t('data.target'),
        }

        const consumptionRow: any = {
          region: item.region,
          type: t('data.consumption'),
        }

        ageKeys.forEach(key => {
          const clean = key.replace(/-/g, "_")
          targetRow[clean] = item.details.target[key]
          consumptionRow[clean] = item.details.consumption[key]
        })

        return [targetRow, consumptionRow]
      })
      : []

  return {
    name: 'vaccine',
    dataSource: rows,
    columns: tableTargetConsumptionVaccineColumns(t, vaccineColumns),
    isLoading: isTargetConsumptionLoading,
    isFetching: isTargetConsumptionFetching,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    total: targetConsumptionData?.total_item,
  }
}
