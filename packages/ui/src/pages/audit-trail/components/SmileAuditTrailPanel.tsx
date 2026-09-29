'use client'

import React, { useMemo, useState } from 'react'
import { DataTable } from '#components/data-table'
import { useFilter } from '#components/filter'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TAuditLog } from '#services/audit-log'
import { useTranslation } from 'react-i18next'

import useAuditTrailTable from '../hooks/useAuditTrailTable'
import auditTrailFilterFormSchema from '../schemas/auditTrailFilterFormSchema'
import AuditLogDetailDrawer from './AuditLogDetailDrawer'
import AuditTrailFilter from './AuditTrailFilter'
import RetentionSettingCard from './RetentionSettingCard'

export default function SmileAuditTrailPanel() {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'auditTrail'])

  const filterSchema = useMemo(
    () => auditTrailFilterFormSchema(t),
    [t, language]
  )

  const filter = useFilter(filterSchema)
  const [selected, setSelected] = useState<TAuditLog | null>(null)

  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
  } = useAuditTrailTable({
    filter: filter?.query,
    onViewDetail: setSelected,
  })

  useSetLoadingPopupStore(isLoading)

  return (
    <div className="ui-space-y-4 mt-6">
      <RetentionSettingCard />
      <AuditTrailFilter filter={filter} handleChangePage={handleChangePage} />
      <DataTable
        isLoading={isLoading}
        data={dataSource?.data}
        columns={tableColumns}
      />
      <PaginationContainer>
        <PaginationSelectLimit
          size={paginate}
          onChange={handleChangePaginate}
          perPagesOptions={dataSource?.list_pagination}
        />
        <PaginationInfo
          size={paginate}
          currentPage={page}
          total={dataSource?.total_item}
        />
        <Pagination
          totalPages={dataSource?.total_page ?? 1}
          currentPage={page}
          onPageChange={handleChangePage}
        />
      </PaginationContainer>
      <AuditLogDetailDrawer item={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
