import React from 'react'
// import { useQuery } from '@tanstack/react-query'
import { ColumnDef, ColumnSort, SortingState } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { EmptyState } from '#components/empty-state'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'

export interface MasterListTableProps<T> {
  data: {
    item: T[]
    total_item: number
    total_page: number
  }
  isLoading: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
  masterTable: {
    columns: ColumnDef<T>[]
    pagination: {
      page: number
      paginate: number
      update: (params: { page: number; paginate?: number }) => void
    }
    querySorting: {
      querySorting: {
        sort_by?: string
        sort_type?: string
      }
      setQuerySorting: (sorting: {
        sort_by?: string
        sort_type?: 'asc' | 'desc'
      }) => void
    }
    sorting: {
      sorting: ColumnSort[]
      setSorting: (sorting: SortingState) => void
    }
  }
}

export const MasterListTable: React.FC<MasterListTableProps<any>> = (props) => {
  const isEmpty = props.data?.item?.length === 0
  const showEmptyState = isEmpty && props.emptyTitle

  if (showEmptyState) {
    return (
      <div className="">
        <EmptyState
          title={props.emptyTitle}
          description={props.emptyDescription}
          emptyIcon={props.emptyIcon}
          withIcon
          className="ui-p-16 ui-rounded-md ui-border"
        />
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={props?.data?.item}
        columns={props.masterTable.columns}
        isLoading={props.isLoading}
        isSticky
        sorting={props.masterTable?.sorting?.sorting}
        setSorting={props.masterTable?.sorting?.setSorting}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={props.masterTable.pagination.paginate}
          onChange={(limit) =>
            props.masterTable.pagination.update({
              page: 1,
              paginate: limit,
            })
          }
        />
        <PaginationInfo
          size={props.masterTable.pagination.paginate}
          currentPage={props.masterTable.pagination.page}
          total={props.data?.total_item}
        />
        <Pagination
          totalPages={props.data?.total_page ?? 0}
          currentPage={props.masterTable.pagination.page}
          onPageChange={(page) => props.masterTable.pagination.update({ page })}
        />
      </PaginationContainer>
    </>
  )
}
