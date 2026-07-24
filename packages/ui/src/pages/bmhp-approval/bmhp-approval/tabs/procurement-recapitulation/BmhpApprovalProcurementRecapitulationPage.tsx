'use client'

import React, { useCallback, useContext, useMemo, useState } from 'react'
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
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceTabs from '../../components/BmhpApprovalProvinceTabs'
import BmhpApprovalProvinceDetailContext from '../province-completeness/libs/bmhp-approval-province-detail.context'
import EditRemainingStockDrawer from './components/EditRemainingStockDrawer'
import ProcurementRecapitulationExportButton from './components/ProcurementRecapitulationExportButton'
import { useProcurementRecapitulation } from './hooks/useProcurementRecapitulation'
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

const BmhpApprovalProcurementRecapitulationPage: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval'])
  const { approvalData } = useContext(BmhpApprovalProvinceDetailContext)

  const programPlanId = approvalData?.id ?? 0

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

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const dateValue = filter.getValues('remaining_stock_date')
      setAppliedFilters({
        remaining_stock_date: dateValue
          ? dayjs(String(dateValue)).format('YYYY-MM-DD')
          : dayjs().format('YYYY-MM-DD'),
      })
    },
    [filter]
  )

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({ remaining_stock_date: dayjs().format('YYYY-MM-DD') })
  }, [filter])

  const params = useMemo<ProcurementRecapitulationParams>(
    () => ({
      program_plan_id: programPlanId,
      remaining_stock_date: appliedFilters.remaining_stock_date,
    }),
    [programPlanId, appliedFilters.remaining_stock_date]
  )

  const isReady = !!programPlanId

  const { data, isLoading, isFetching, refetch } = useProcurementRecapitulation(
    { params, enabled: isReady }
  )

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Drawer / modal state ───────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false)
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false)

  // ── Column definitions ─────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<ProcurementRecapitulationItem>[]>(
    () => [
      {
        id: 'no',
        header: t('bmhpApproval:procurement_recapitulation.table.col_no'),
        cell: ({ row }) => row.index + 1,
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

  return (
    <BmhpApprovalProvinceTabs>
      <div className="ui-space-y-4 ui-mt-6">
        {/* Filter */}
        <FilterFormRoot collapsible={false} onSubmit={handleFilterSubmit}>
          <FilterFormBody className="ui-flex-row ui-flex">
            <div className="ui-flex-1 ui-w-full">{filter.renderField()}</div>
            <div className="ui-items-end ui-flex ui-w-fit ui-space-x-2">
              <ProcurementRecapitulationExportButton
                programPlanId={programPlanId}
                remainingStockDate={appliedFilters.remaining_stock_date}
              />
              <div className="ui-border-l ui-border-gray-300 ui-h-10" />
              <FilterResetButton onClick={handleFilterReset} variant="subtle" />
              <FilterSubmitButton className="ui-w-40" variant="solid" />
            </div>
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
                disabled={!isReady || isLoading}
                leftIcon={
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
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
          />
        </div>
      </div>

      {/* Edit Remaining Stock drawer */}
      <EditRemainingStockDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        programPlanId={programPlanId}
        tanggalSisaStok={appliedFilters.remaining_stock_date}
        onSaved={() => refetch()}
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
        onSubmit={() => {
          setSubmitConfirmOpen(false)
        }}
        buttonTitle={
          t(
            'bmhpApproval:procurement_recapitulation.submit.btn_confirm'
          ) as string
        }
      />
    </BmhpApprovalProvinceTabs>
  )
}

export default BmhpApprovalProcurementRecapitulationPage
