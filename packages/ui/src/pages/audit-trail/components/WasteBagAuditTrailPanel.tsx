'use client'

import React from 'react'
import { DataTable } from '#components/data-table'
import { InputSearch } from '#components/input'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
} from '#components/pagination'
import { useTranslation } from 'react-i18next'

import useWasteBagAuditTrailTable from '../hooks/useWasteBagAuditTrailTable'

export default function WasteBagAuditTrailPanel() {
  const { t } = useTranslation(['auditTrail', 'common'])
  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    search,
    handleChangePage,
    handleChangeSearch,
  } = useWasteBagAuditTrailTable()

  return (
    <div className="ui-space-y-4 mt-6">
      <InputSearch
        placeholder={t('auditTrail:form.wms_search.placeholder')}
        defaultValue={search}
        onChange={(e) => handleChangeSearch(e.target.value)}
        className="ui-max-w-sm"
      />
      <DataTable
        isLoading={isLoading}
        data={dataSource?.data}
        columns={tableColumns}
      />
      <PaginationContainer>
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={dataSource?.pagination?.total}
        />
        <Pagination
          totalPages={dataSource?.pagination?.pages ?? 1}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
    </div>
  )
}
