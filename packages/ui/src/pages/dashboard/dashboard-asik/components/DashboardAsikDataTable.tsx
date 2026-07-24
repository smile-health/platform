import { forwardRef, useImperativeHandle } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardDataTable from '#pages/dashboard/components/DashboardDataTable'
import { useTranslation } from 'react-i18next'

import usePagination from '../../hooks/usePagination'
import {
  DashboardAsikTabType,
  getDashboardAsikColumns,
} from '../dashboard-asik.constant'
import { handleFilter } from '../dashboard-asik.helper'
import { getDashboardAsikDataTable } from '../dashboard-asik.service'
import {
  TAsikItem,
  TDashboardAsikFilter,
  TImperativeHandle,
} from '../dashboard-asik.type'

type Props = Readonly<{
  filter: TDashboardAsikFilter
  region: DashboardAsikTabType
  enabled?: boolean
}>

const DashboardAsikDataTable = forwardRef<TImperativeHandle, Props>(
  ({ filter, region, enabled = false }, ref) => {
    const {
      t,
      i18n: { language },
    } = useTranslation('dashboardAsik')

    const {
      page,
      paginate,
      handleChangePage,
      handleChangePaginate,
      handleResetPagination,
    } = usePagination()

    const params = handleFilter(filter)

    const {
      data: dataSource,
      isLoading,
      isFetching,
    } = useQuery({
      queryKey: ['dashboard-asik-datatable', params, page, paginate, region],
      queryFn: () =>
        getDashboardAsikDataTable({ ...params, page, paginate, region }),
      enabled: !!params?.from && !!params?.to && enabled,
    })

    useImperativeHandle(ref, () => ({
      onResetPage: handleResetPagination,
    }))

    return (
      <DashboardDataTable
        data={(dataSource?.data as TAsikItem[]) ?? []}
        isLoading={isLoading || isFetching}
        page={page}
        paginate={paginate}
        columns={getDashboardAsikColumns(t, page, paginate, language)}
        totalItem={dataSource?.total_item}
        totalPage={dataSource?.total_page}
        listPagination={dataSource?.list_pagination}
        onChangePage={handleChangePage}
        onChangePaginate={handleChangePaginate}
      />
    )
  }
)

DashboardAsikDataTable.displayName = 'DashboardAsikDataTable'

export default DashboardAsikDataTable
