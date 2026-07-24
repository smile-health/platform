import { useQuery } from '@tanstack/react-query'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { getReactSelectValue } from '#utils/react-select'

import {
  GetListAnnualCommitmentParams,
  listAnnualCommitments,
} from '../../annual-commitment-list.service'
import useAnnualCommitmentListFilter from '../filter/useAnnualCommitmentListFilter'
import useAnnualCommitmentListTable from './useAnnualCommitmentListTable'

export default function AnnualCommitmentListTable() {
  const annualCommitmentListTable = useAnnualCommitmentListTable()
  const annualCommitmentListFilter = useAnnualCommitmentListFilter()

  const params: GetListAnnualCommitmentParams = {
    page: annualCommitmentListTable.pagination.page,
    item_per_page: annualCommitmentListTable.pagination.paginate,
    total_item: annualCommitmentListFilter?.query?.total_item,
    total_page: annualCommitmentListFilter?.query?.total_page,
    list_pagination: annualCommitmentListFilter?.query?.list_pagination,
    sort_by: annualCommitmentListTable?.querySorting?.querySorting?.sort_by,
    sort_type: annualCommitmentListTable?.querySorting?.querySorting?.sort_type,
    contract_number_id: getReactSelectValue(
      annualCommitmentListFilter?.query.contract_number
    ),
    material_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.material
    ),
    province_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.province
    ),
    supplier_id: getReactSelectValue(
      annualCommitmentListFilter?.query?.supplier
    ),
    year: getReactSelectValue(annualCommitmentListFilter?.query?.year),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['annual-commitment-list', params],
    queryFn: () => listAnnualCommitments(params),
    enabled: true,
  })

  return (
    <>
      <DataTable
        data={data?.data}
        columns={annualCommitmentListTable.columns}
        isLoading={isLoading}
        isSticky
        sorting={annualCommitmentListTable?.sorting?.sorting}
        setSorting={annualCommitmentListTable?.sorting?.setSorting}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={annualCommitmentListTable.pagination.paginate}
          onChange={(limit) =>
            annualCommitmentListTable.pagination.update({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={annualCommitmentListTable.pagination.paginate}
          currentPage={annualCommitmentListTable.pagination.page}
          total={data?.total_item}
        />
        <Pagination
          totalPages={data?.total_page ?? 0}
          currentPage={annualCommitmentListTable.pagination.page}
          onPageChange={(page) =>
            annualCommitmentListTable.pagination.update({ page })
          }
        />
      </PaginationContainer>
    </>
  )
}
