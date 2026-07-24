'use client'

import React, { useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useCompletenessMonitoring } from '../../tabs/completeness-monitoring/hooks/useCompletenessMonitoring'
import { useCompletenessTableColumns } from '../../tabs/completeness-monitoring/hooks/useCompletenessTableColumns'
import {
  TCompletenessItem,
  TExaminationColumn,
} from '../../tabs/completeness-monitoring/libs/completeness-monitoring.type'
import BmhpApprovalDetailTabs from '../BmhpApprovalDetailTabs'

// ── Page Content ──────────────────────────────────────────────────────────────

const CompletenessMonitoringDetailPageContent: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval'])
  const { query } = useSmileRouter()
  const idFromUrl = query.year_id ? Number(query.year_id) : undefined

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Query params ───────────────────────────────────────────────────────────
  const params = useMemo(
    () => ({
      program_plan_id: idFromUrl ?? 0,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [idFromUrl, query.regency_id, pagination]
  )

  const { data, isLoading, isFetching } = useCompletenessMonitoring({
    params,
    enabled: !!idFromUrl,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Inject si_no & derive unique examination columns ───────────────────────
  const { dataWithNo, examinationColumns } = useMemo<{
    dataWithNo: TCompletenessItem[]
    examinationColumns: TExaminationColumn[]
  }>(() => {
    const rows = data?.data ?? []
    const offset = (pagination.page - 1) * pagination.item_per_page
    const dataWithNo = rows.map((row, idx) => ({
      ...row,
      si_no: offset + idx + 1,
    }))

    const columnMap = new Map<number, TExaminationColumn>()
    rows.forEach((row) => {
      row.screenings.forEach((s) => {
        if (!columnMap.has(s.examination_id)) {
          columnMap.set(s.examination_id, {
            examination_id: s.examination_id,
            examination_name: s.examination_name,
          })
        }
      })
    })

    return {
      dataWithNo,
      // examinationColumns: Array.from(columnMap.values()).sort(
      //   (a, b) => a.examination_id - b.examination_id
      // ),
      examinationColumns: Array.from(columnMap.values()),
    }
  }, [data, pagination.page, pagination.item_per_page])

  const tableColumns = useCompletenessTableColumns(examinationColumns)

  // ── Pagination logic ───────────────────────────────────────────────────────
  const totalItems = data?.total_item ?? 0
  const totalPages = data?.total_page ?? 0

  return (
    <div className="ui-border ui-p-5 ui-space-y-4 ui-mt-6">
      <div className="ui-flex ui-items-center ui-justify-between">
        <h5 className="ui-text-base ui-font-semibold">
          {t('bmhpApproval:completeness.health_care_list')}
        </h5>
      </div>

      <DataTable
        data={dataWithNo}
        columns={tableColumns}
        isLoading={isLoading || isFetching}
        isSticky
        stickyColumns={[0, 1, 2 + examinationColumns.length]}
      />

      {/* Status Legend */}
      <div className="ui-flex ui-items-center ui-gap-6 ui-mt-3 ui-text-sm">
        <span className="ui-font-semibold">
          {t('bmhpApproval:completeness.legend_status')}:
        </span>
        <span className="ui-flex ui-items-center ui-gap-1.5">
          <XCircleIcon className="ui-w-5 ui-h-5 ui-text-danger-500" />
          {t('bmhpApproval:completeness.legend_not_submitted')}
        </span>
        <span className="ui-flex ui-items-center ui-gap-1.5">
          <CheckCircleIcon className="ui-w-5 ui-h-5 ui-text-success-500" />
          {t('bmhpApproval:completeness.legend_done')}
        </span>
        <span className="ui-flex ui-items-center ui-gap-1.5">
          <span className="ui-inline-flex ui-items-center ui-justify-center ui-w-9 ui-h-6 ui-rounded-full ui-bg-neutral-100 ui-text-neutral-400 ui-text-xs ui-font-medium">
            N/A
          </span>
          {t('bmhpApproval:completeness.legend_na')}
        </span>
      </div>

      {/* Pagination */}
      <PaginationContainer className="ui-mt-4">
        <PaginationSelectLimit
          size={pagination.item_per_page}
          onChange={(limit: number) =>
            setPagination({ page: 1, item_per_page: limit })
          }
          perPagesOptions={data?.list_pagination}
        />
        <PaginationInfo
          size={pagination.item_per_page}
          currentPage={pagination.page}
          total={totalItems}
        />
        <Pagination
          totalPages={totalPages}
          currentPage={pagination.page}
          onPageChange={(page: number) => setPagination({ page })}
        />
      </PaginationContainer>
    </div>
  )
}

// ── Wrapped with detail tabs ───────────────────────────────────────────────────

const CompletenessMonitoringDetailPage: React.FC = () => {
  return (
    <BmhpApprovalDetailTabs>
      <CompletenessMonitoringDetailPageContent />
    </BmhpApprovalDetailTabs>
  )
}

export default CompletenessMonitoringDetailPage
