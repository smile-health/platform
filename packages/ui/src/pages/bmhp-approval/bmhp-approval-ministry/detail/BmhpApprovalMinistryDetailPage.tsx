'use client'

import React, { useMemo, useRef } from 'react'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import ExportHistory from '#components/icons/ExportHistory'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import Export from '#components/icons/Export'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { numberFormatter } from '#utils/formatter'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useMinistryProcurement } from './hooks/useMinistryProcurement'
import { useMinistryProcurementExport } from './hooks/useMinistryProcurementExport'
import { useBeritaAcaraPdf } from './hooks/useBeritaAcaraPdf'
import { useMinistryRecapitulationDetail } from './hooks/useMinistryRecapitulationDetail'
import { MinistryProcurementItem } from './services/ministry-detail.service'

const MaterialNameCell = ({ row }: CellContext<MinistryProcurementItem, unknown>) => (
  <span className="ui-font-medium">{row.original.name}</span>
)

const BmhpApprovalMinistryDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  const { query, push } = useSmileRouter() as {
    query: { id?: string; city_id?: string; city_name?: string; regency_name?: string; province_name?: string; year?: string; program_plan_id?: string }
    push: (path: string) => void
  }
  const idStr = query?.city_id ?? query?.id ?? ''
  const programPlanIdStr = query?.program_plan_id ?? ''

  const isReady = !!idStr

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  const { data, isLoading, isFetching } = useMinistryProcurement({
    entity_id: idStr,
    program_plan_id: programPlanIdStr ? Number(programPlanIdStr) : null,
    page: pagination.page,
    paginate: pagination.item_per_page,
  })

  const { exportData, isLoading: isExporting } = useMinistryProcurementExport({
    entity_id: idStr,
    program_plan_id: programPlanIdStr ? Number(programPlanIdStr) : null,
    page: pagination.page,
    paginate: pagination.item_per_page,
  })

  const { downloadPdf, isLoading: isDownloadingPdf } = useBeritaAcaraPdf({
    entity_id: idStr,
    program_plan_id: programPlanIdStr ? Number(programPlanIdStr) : null,
  })

  const { data: recapDetail } = useMinistryRecapitulationDetail({
    entity_id: idStr,
    program_plan_id: programPlanIdStr ? Number(programPlanIdStr) : null,
  })

  const provinceId = query?.id

  useSetLoadingPopupStore((isLoading || isFetching || isExporting || isDownloadingPdf) && isReady)

  const pageOffsetRef = useRef(0)
  pageOffsetRef.current = (pagination.page - 1) * pagination.item_per_page

  const columns = useMemo<ColumnDef<MinistryProcurementItem>[]>(
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
          numberFormatter(row.original.total_kebutuhan, i18n.language),
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
          numberFormatter(row.original.sisa_stok, i18n.language),
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
          numberFormatter(row.original.usulan_pengadaan, i18n.language),
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
      {
        accessorKey: 'desk_result',
        header: t(
          'bmhpApproval:procurement_recapitulation.table.col_desk_result'
        ),
        size: 180,
        meta: {
          headerClassName: 'ui-text-center',
          cellClassName: 'ui-text-center',
        },
        cell: ({ row }) =>
          numberFormatter(row.original.hasil_desk, i18n.language),
      },
    ],
    [t, i18n.language]
  )

  const remainingStockDateFormatted = useMemo(() => {
    const raw = recapDetail?.data?.remaining_stock_date
    if (!raw) return '-'
    return new Date(`${raw}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }, [recapDetail?.data?.remaining_stock_date])

  const items = data?.data ?? []
  const totalItem = data?.total_item ?? 0
  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]
  const totalPages = data?.total_page ?? 1

  return (
      <Container
      title={t('bmhpApproval:label.review')}
      withLayout
      backButton={{
        show: true,
        onClick: () => {
          const queryParams: Record<string, string> = {}
          if (query.program_plan_id) queryParams.program_plan_id = String(query.program_plan_id)

          const queryString = new URLSearchParams(queryParams).toString()
          const queryPrefix = queryString ? `?${queryString}` : ''
          push(`/v5/bmhp-approval-ministry/kako/${provinceId}${queryPrefix}`)
        },
        label: t('bmhpApproval:back_to_regency_list'),
      }}
    >

      <Meta title={`SMILE | ${t('bmhpApproval:label.review')}`} />

      <div className="ui-mt-6 ui-space-y-4">
        {/* Location info banner */}
        <div className="ui-flex ui-flex-wrap ui-gap-4 ui-p-4 ui-border ui-border-gray-200 ui-rounded ui-bg-gray-50">
          <div className="ui-flex ui-items-center ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500">
              {t('bmhpApproval:completeness.province')}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.province_name ?? '-'}
            </span>
          </div>
          <span className="ui-text-neutral-300">|</span>
          <div className="ui-flex ui-items-center ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500">
              {t('bmhpApproval:completeness.city')}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.regency_name ?? '-'}
            </span>
          </div>
          <span className="ui-text-neutral-300">|</span>
          <div className="ui-flex ui-items-center ui-gap-2">
            <span className="ui-text-sm ui-text-neutral-500">
              {t('bmhpApproval:completeness.program_plan')}:
            </span>
            <span className="ui-text-sm ui-font-semibold">
              {recapDetail?.data?.year ?? '-'}
            </span>
          </div>
        </div>

        <div className="ui-bg-white ui-border ui-border-gray-200 ui-rounded-lg ui-p-4 ui-space-y-4">
          <div className="ui-flex ui-items-center ui-justify-between">
            <div className="ui-text-base">
              <p className="ui-font-semibold ui-text-dark-blue">
                {t('bmhpApproval:procurement_recapitulation.table.title')}
              </p>
              <p className="ui-text-sm ui-text-neutral-400">
                {t('bmhpApproval:procurement_recapitulation.table.stock_date_subtitle', {
                  date: remainingStockDateFormatted,
                  defaultValue: `Tanggal sisa stok: ${remainingStockDateFormatted} (berdasarkan input dari Dinkes Kabupaten/Kota)`,
                })}
              </p>
            </div>
            <div className="ui-flex ui-items-center ui-gap-3">
              <Button
                variant="outline"
                color="primary"
                leftIcon={<ExportHistory className="ui-size-5" />}
                onClick={() => downloadPdf.mutate()}
                loading={isDownloadingPdf}
                disabled={!isReady || isLoading || isDownloadingPdf}
              >
                {t('bmhpApproval:button.statement_letter')}
              </Button>

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
          </div>

          <DataTable
            withBorder
            id="ministryProcurementRecapDetailTable"
            columns={columns}
            data={items}
            isLoading={isLoading}
            getRowId={(_, index) => String(pageOffsetRef.current + index)}
          />

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
    </Container>
  )
}

export default BmhpApprovalMinistryDetailPage
