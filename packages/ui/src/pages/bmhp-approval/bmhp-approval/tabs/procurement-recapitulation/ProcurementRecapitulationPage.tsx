'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { CellContext, ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useProfile } from '#shared/auth'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useBmhpApprovalDetailData } from '../../list/hooks/useBmhpApprovalDetailData'
import BmhpApprovalTabs from '../BmhpApprovalTabs'
import { useReviewProgramPlan } from '../target-and-adjustment/hooks/useTargetAdjustmentMutations'
import EditRemainingStockDrawer from './components/EditRemainingStockDrawer'
import ProcurementRecapitulationExportButton from './components/ProcurementRecapitulationExportButton'
import {
  useProcurementRecapitulation,
  useSaveRemainingStock,
} from './hooks/useProcurementRecapitulation'
import { procurementRecapitulationFilterSchema } from './libs/procurement-recapitulation.filter'
import {
  ProcurementRecapitulationItem,
  ProcurementRecapitulationParams,
} from './libs/procurement-recapitulation.type'

const MaterialNameCell = ({
  row,
}: CellContext<ProcurementRecapitulationItem, unknown>) => (
  <span className="ui-font-medium">{row.original.name}</span>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProcurementRecapitulationPage: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  const { query, push } = useSmileRouter()
  const programPlanId = query.year_id ? Number(query.year_id) : 0

  const { data: profile } = useProfile()
  const provinceName = profile?.entity?.province?.name
  const cityName = profile?.entity?.regency?.name
  const { approvalData } = useBmhpApprovalDetailData()
  const programPlanYear = approvalData?.year ?? undefined

  // ── Applied filters (only update on filter submit) ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    remaining_stock_date: dayjs().format('YYYY-MM-DD'),
  })

  // ── Filter schema ──────────────────────────────────────────────────────────
  const filterSchema = useMemo<UseFilter>(
    () => procurementRecapitulationFilterSchema({ t }),
    [t]
  )
  const filter = useFilter(filterSchema)

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Filter handlers ────────────────────────────────────────────────────────
  const applyFilterSubmit = useCallback(() => {
    const dateValue = filter.getValues('remaining_stock_date')
    setAppliedFilters({
      remaining_stock_date: dateValue
        ? dayjs(String(dateValue)).format('YYYY-MM-DD')
        : dayjs().format('YYYY-MM-DD'),
    })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleFilterSubmit = useCallback(() => {
    setDateChangeConfirmOpen(true)
  }, [])

  const handleConfirmDateChange = useCallback(() => {
    filter.handleSubmit()
    applyFilterSubmit()
    setDateChangeConfirmOpen(false)
  }, [filter, applyFilterSubmit])

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({ remaining_stock_date: dayjs().format('YYYY-MM-DD') })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const params = useMemo<ProcurementRecapitulationParams>(
    () => ({
      program_plan_id: programPlanId,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      remaining_stock_date: appliedFilters.remaining_stock_date,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [
      programPlanId,
      query.regency_id,
      appliedFilters.remaining_stock_date,
      pagination,
    ]
  )

  const isReady = !!programPlanId

  const { data, isLoading, isFetching, refetch } = useProcurementRecapitulation(
    { params, enabled: isReady }
  )

  const allItemsParams = useMemo<ProcurementRecapitulationParams>(
    () => ({
      program_plan_id: programPlanId,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      remaining_stock_date: appliedFilters.remaining_stock_date,
    }),
    [programPlanId, query.regency_id, appliedFilters.remaining_stock_date]
  )

  const { data: allData } = useProcurementRecapitulation({
    params: allItemsParams,
    enabled: isReady,
  })

  const { sendRevision, isSending } = useReviewProgramPlan()
  const { save, isSaving } = useSaveRemainingStock()
  const isSubmitting = isSaving || isSending

  useSetLoadingPopupStore(isLoading || isFetching || isSubmitting)

  const handleConfirmSubmit = useCallback(() => {
    // Kirim SEMUA data ketika trigger dari button "Kirim ke Provinsi"
    const saveItems = (allData?.data ?? []).map((item) => ({
      material_id: item.material_id,
      ...(item.variant_id == null ? {} : { variant_id: item.variant_id }),
      remaining_stock: item.remaining_stock,
    }))

    save(
      { program_plan_id: programPlanId, items: saveItems },
      {
        onSuccess: () => {
          sendRevision(
            {
              program_plan_id: programPlanId,
              status: 1,
              remaining_stock_date: appliedFilters.remaining_stock_date,
            },
            {
              onSuccess: () => {
                setSubmitConfirmOpen(false)
                push('/v5/bmhp-approval')
              },
            }
          )
        },
      }
    )
  }, [save, sendRevision, programPlanId, push, allData])

  // ── Drawer / modal state ───────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)
  const [dateChangeConfirmOpen, setDateChangeConfirmOpen] = useState(false)

  // ── Server-side pagination ──────────────────────────────────────────────────
  const items = data?.data ?? []
  const totalItem = data?.total_item ?? 0
  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]
  const totalPages = data?.total_page ?? 1

  // Always-fresh pageOffset via ref so columns memo stays stable
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language]
  )

  return (
    <BmhpApprovalTabs>
      <div className="ui-space-y-4 ui-mt-6">
        {/* Filter */}
        <FilterFormRoot
          collapsible
          onSubmit={(e) => {
            e.preventDefault()
            handleFilterSubmit()
          }}
        >
          <FilterFormBody className="ui-flex ui-flex-row ui-items-end ui-gap-2">
            <div className="ui-flex-1">{filter.renderField()}</div>
            <ProcurementRecapitulationExportButton
              programPlanId={programPlanId}
              remainingStockDate={appliedFilters.remaining_stock_date}
            />
            <span className="ui-h-9 ui-w-px ui-bg-neutral-300" />
            <FilterResetButton onClick={handleFilterReset} variant="subtle" />
            <FilterSubmitButton
              className="ui-w-[202px]"
              variant="outline"
              text={t('common:search')}
            />
          </FilterFormBody>
          {filter.renderActiveFilter()}
        </FilterFormRoot>
        <div className="ui-border ui-p-5 ui-space-y-4">
          {/* Table header row */}
          <div className="ui-flex ui-items-center ui-justify-between">
            <h3 className="ui-text-base ui-font-semibold ui-text-dark-blue">
              {t('bmhpApproval:procurement_recapitulation.table.title')}
            </h3>
            <div className="ui-flex ui-items-center ui-gap-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                disabled={!isReady || isLoading}
              >
                {t(
                  'bmhpApproval:procurement_recapitulation.table.btn_edit_remaining_stock'
                )}
              </Button>
              <Button
                variant="solid"
                onClick={() => setSubmitConfirmOpen(true)}
                disabled={!isReady || isLoading || isSubmitting}
                leftIcon={<PaperAirplaneIcon className="ui-h-5 ui-w-5" />}
              >
                {t(
                  'bmhpApproval:procurement_recapitulation.table.btn_submit_to_province'
                )}
              </Button>
            </div>
          </div>
          {/* Table */}
          <DataTable
            withBorder
            id="procurementRecapTable"
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

      {/* Edit Remaining Stock drawer */}
      <EditRemainingStockDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        programPlanId={programPlanId}
        tanggalSisaStok={appliedFilters.remaining_stock_date}
        onSaved={() => refetch()}
        provinceName={provinceName}
        cityName={cityName}
        programPlanYear={programPlanYear}
      />

      {/* Submit to Province confirmation */}
      <ModalConfirmation
        open={submitConfirmOpen}
        setOpen={setSubmitConfirmOpen}
        title={
          t(
            'bmhpApproval:procurement_recapitulation.submit.confirm_title'
          ) as string
        }
        description={
          t(
            'bmhpApproval:procurement_recapitulation.submit.confirm_desc'
          ) as string
        }
        onSubmit={handleConfirmSubmit}
        buttonTitle={
          t(
            'bmhpApproval:procurement_recapitulation.submit.btn_confirm'
          ) as string
        }
      />

      {/* Date change confirmation */}
      <ModalConfirmation
        open={dateChangeConfirmOpen}
        setOpen={setDateChangeConfirmOpen}
        title={
          t(
            'bmhpApproval:procurement_recapitulation.filter.confirm_title'
          ) as string
        }
        description={
          t(
            'bmhpApproval:procurement_recapitulation.filter.confirm_desc'
          ) as string
        }
        onSubmit={handleConfirmDateChange}
        buttonTitle={
          t(
            'bmhpApproval:procurement_recapitulation.filter.btn_confirm_date'
          ) as string
        }
      />
    </BmhpApprovalTabs>
  )
}

export default ProcurementRecapitulationPage
