import { Dispatch, SetStateAction, useMemo } from 'react'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import {
  DefaultDashboardSelection,
  getColumns,
  TableType,
} from '../dashboard-smile-smdv.constant'
import {
  SmileVsSmdvEntityResponse,
  SmileVsSmdvMaterialResponse,
} from '../dashboard-smile-smdv.type'

type Props = Readonly<{
  activeTab: TableType
  isLoading: boolean
  page: number
  paginate: number
  data: SmileVsSmdvEntityResponse | SmileVsSmdvMaterialResponse | undefined
  setPagination: Dispatch<
    SetStateAction<{
      page: number
      paginate: number
    }>
  >
  defaultDashboard: DefaultDashboardSelection
}>

export default function DashboardSmileSmdvTable({
  data,
  isLoading,
  setPagination,
  page,
  paginate,
  activeTab,
  defaultDashboard,
}: Props) {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardSmileSmdv')

  const columns = useMemo(
    () => getColumns(t, page, paginate, activeTab, language, defaultDashboard),
    [t, page, paginate, activeTab, language, defaultDashboard]
  )

  return (
    <div className="ui-space-y-6">
      <DataTable isLoading={isLoading} data={data?.data} columns={columns} />
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={(paginate) => setPagination({ page: 1, paginate })}
          perPagesOptions={data?.list_pagination}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={data?.total_item}
        />
        <Pagination
          totalPages={data?.total_page ?? 1}
          currentPage={page}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </PaginationContainer>
    </div>
  )
}
