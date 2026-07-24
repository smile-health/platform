'use client'

import React, { useContext, useMemo, useRef } from 'react'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import Export from '#components/icons/Export'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { numberFormatter } from '#utils/formatter'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceDetailTabs from '../../components/BmhpApprovalProvinceDetailTabs'
import BmhpApprovalProvinceDetailContext from '../../tabs/province-completeness/libs/bmhp-approval-province-detail.context'
import { useProcurementRecapitulation } from '../../tabs/procurement-recapitulation/hooks/useProcurementRecapitulation'
import { useProcurementRecapitulationExport } from '../../tabs/procurement-recapitulation/hooks/useProcurementRecapitulationExport'
import { ProcurementRecapitulationItem } from '../../tabs/procurement-recapitulation/libs/procurement-recapitulation.type'

const MaterialNameCell = ({
  row,
}: CellContext<ProcurementRecapitulationItem, unknown>) => (
  <span className="ui-font-medium">{row.original.name}</span>
)

// ── Page Content ──────────────────────────────────────────────────────────────

const ProcurementRecapitulationProvinceDetailPageContent: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  const { approvalData } = useContext(BmhpApprovalProvinceDetailContext)

  const programPlanId = approvalData?.id ?? 0
  const isReady = !!programPlanId

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  const { data, isLoading, isFetching } = useProcurementRecapitulation({
    params: {
      program_plan_id: programPlanId,
      page: pagination.page,
      paginate: pagination.item_per_page,
    },
    enabled: isReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  const { exportData, isLoading: isExporting } =
    useProcurementRecapitulationExport({
      program_plan_id: programPlanId,
    })

  const pageOffsetRef = useRef(0)
  pageOffsetRef.current = (pagination.page - 1) * pagination.item_per_page

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<ProcurementRecapitulationItem>[]>(
    () => [
      {
        id: 'no',
        header: t('bmhpApproval:procurement_recapitulation.table.col_no'),
        cell: ({ row }) => pageOffsetRef.current + row.index + 1,
        size: 56,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center ui-text-neutral-500',
        },
      },
      {
        accessorKey: 'name',
        header: t('bmhpApproval:procurement_recapitulation.table.col_material'),
        cell: MaterialNameCell,
      },
      {
        accessorKey: 'unit',
        header: t('bmhpApproval:procurement_recapitulation.table.col_unit'),
        size: 120,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center ui-text-neutral-500',
        },
      },
      {
        accessorKey: 'total_needs',
        header: t(
          'bmhpApproval:procurement_recapitulation.table.col_total_needs'
        ),
        size: 160,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.total_needs, i18n.language),
      },
      {
        accessorKey: 'remaining_stock',
        header: t(
          'bmhpApproval:procurement_recapitulation.table.col_remaining_stock'
        ),
        size: 160,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.remaining_stock, i18n.language),
      },
      {
        accessorKey: 'procurement_proposal',
        header: t(
          'bmhpApproval:procurement_recapitulation.table.col_procurement_proposal'
        ),
        size: 180,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.procurement_proposal, i18n.language),
      },
      {
        accessorKey: 'proposal_buffer',
        header: t(
          'bmhpApproval:procurement_recapitulation.table.col_proposal_buffer'
        ),
        size: 180,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.proposal_buffer, i18n.language),
      },
    ],
    [t, i18n.language]
  )

  const items = data?.data ?? []
  const totalItem = data?.total_item ?? 0
  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]
  const totalPages = data?.total_page ?? 1

  return (
    <div className="ui-mt-6 ui-space-y-4">
      <div className="ui-bg-white ui-border ui-border-gray-200 ui-rounded-lg ui-p-4 ui-space-y-4">
        {/* Table header row */}
        <div className="ui-flex ui-items-center ui-justify-between">
          <h3 className="ui-text-base ui-font-semibold ui-text-dark-blue">
            {t('bmhpApproval:procurement_recapitulation.table.title')}
          </h3>
          <Button
            variant="outline"
            color="primary"
            leftIcon={<Export className="ui-size-5" />}
            onClick={() => exportData.mutate()}
            loading={isExporting}
            disabled={!isReady || isLoading || isExporting}
          >
            {t('common:export')}
          </Button>
        </div>

        {/* Table */}
        <DataTable
          withBorder
          id="procurementRecapProvinceDetailTable"
          columns={columns}
          data={items}
          isLoading={isLoading}
          getRowId={(_, index) => String(pageOffsetRef.current + index)}
        />

        {/* Pagination */}
        <PaginationContainer>
          <PaginationSelectLimit
            perPagesOptions={listPagination}
            size={pagination.item_per_page}
            onChange={(val: number) =>
              setPagination({ page: 1, item_per_page: val })
            }
          />
          <PaginationInfo
            total={totalItem}
            currentPage={pagination.page}
            size={pagination.item_per_page}
          />
          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={(page: number) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </div>
  )
}

// ── Wrapped with province detail tabs ─────────────────────────────────────────

const ProcurementRecapitulationProvinceDetailPage: React.FC = () => {
  return (
    <BmhpApprovalProvinceDetailTabs>
      <ProcurementRecapitulationProvinceDetailPageContent />
    </BmhpApprovalProvinceDetailTabs>
  )
}

export default ProcurementRecapitulationProvinceDetailPage
