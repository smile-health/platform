import { forwardRef } from 'react'
import DashboardTable from '#pages/dashboard/components/DashboardTable'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  getDashboardIOTDataTable,
  getDashboardIOTHeaders,
} from '../../dashboard.helper'
import { TDashboardIOTFilter, TDashboardIOTHandler } from '../../dashboard.type'
import useDashboardIOTMaterial from '../../hooks/useDashboardIOTMaterial'
import usePagination from '../../hooks/usePagination'

type Props = {
  enabled?: boolean
  filter: TDashboardIOTFilter
}

const DashboardDiscardMaterial = forwardRef<TDashboardIOTHandler, Props>(
  ({ filter, enabled = false }, ref) => {
    const {
      i18n: { language },
    } = useTranslation()

    const {
      page,
      paginate,
      handleChangePage,
      handleChangePaginate,
      handleResetPagination,
    } = usePagination()

    const { dataSource, isLoading } = useDashboardIOTMaterial(ref, {
      path: 'stock-discard',
      filter,
      page,
      paginate,
      onResetPage: handleResetPagination,
      enabled,
    })

    const { periodLabels, types } = getDashboardIOTHeaders(
      dataSource?.data?.categories ?? [],
      dataSource?.data?.type ?? []
    )

    const headers = [
      [
        {
          label: 'SI.NO',
          class: periodLabels?.length
            ? 'ui-sticky ui-left-0 ui-min-w-14 ui-w-14'
            : '',
        },
        {
          label: 'Material',
          class: periodLabels?.length
            ? 'ui-sticky ui-left-14 ui-min-w-60 ui-w-60 ui-border-r ui-border-gray-300'
            : '',
        },
        ...periodLabels,
      ],
      types?.length
        ? [
            {
              label: '',
              colSpan: 2,
              class:
                'ui-sticky ui-left-0 ui-min-w-14 ui-w-14 ui-border-r ui-border-gray-300',
            },
            ...types,
          ]
        : [],
    ]

    const tableData = getDashboardIOTDataTable({
      page,
      paginate,
      periodLabels,
      data: dataSource?.data?.dataset,
      types: dataSource?.data?.type,
      formatter: (value) =>
        typeof value === 'number' ? numberFormatter(value, language) : value,
    })

    return (
      <DashboardTable
        isLoading={isLoading}
        headers={headers}
        rows={tableData ?? []}
        page={page}
        paginate={paginate}
        totalItem={dataSource?.total_item}
        totalPage={dataSource?.total_page}
        listPagination={dataSource?.list_pagination}
        handleChangePage={handleChangePage}
        handleChangePaginate={handleChangePaginate}
      />
    )
  }
)

DashboardDiscardMaterial.displayName = 'DashboardDiscardMaterial'

export default DashboardDiscardMaterial
