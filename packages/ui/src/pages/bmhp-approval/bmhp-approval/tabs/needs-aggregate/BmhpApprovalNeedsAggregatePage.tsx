'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { DataTable } from '#components/data-table'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { useProfile } from '#shared/auth'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceTabs from '../../components/BmhpApprovalProvinceTabs'
import { MonitoringCard, ScreeningSummaryTable } from '../../tabs/shared'
import PreviewDrawer from './components/PreviewDrawer'
import ReviewNeedsDrawer from './components/ReviewNeedsDrawer'
import { useBmhpApprovalNeedsAggregateTable } from './hooks/useBmhpApprovalNeedsAggregateTable'
import { useBmhpApprovalNeedsAggregateTableColumns } from './hooks/useBmhpApprovalNeedsAggregateTableColumns'
import { useExportNeedsAggregateXls } from './hooks/useNeedsAggregateOperations'
import { TNeedsAggregateItem } from './libs/needs-aggregate.types'

// ── Page ──────────────────────────────────────────────────────────────────────

const BmhpApprovalNeedsAggregatePageContent: React.FC = () => {
  const { t } = useTranslation('bmhpApproval')
  const { query, push } = useSmileRouter()
  const yearFromUrl = query.year_id ? Number(query.year_id) : undefined
  const { data: profile } = useProfile()

  // ── Drawer state ───────────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<{
    city_id: number
    city_name: string
    province_name?: string
    year?: number
  } | null>(null)

  // ── Pagination for needs aggregate table ───────────────────────────────────────
  const [needsAggregatePagination, setNeedsAggregatePagination] =
    useQueryStates(
      {
        page: parseAsInteger.withDefault(1),
        item_per_page: parseAsInteger.withDefault(10),
      },
      { history: 'push' }
    )

  // ── Needs Aggregate table params ────────────────────────────────────────────────
  const needsAggregateParams = useMemo(
    () => ({
      program_plan_id: Number(yearFromUrl ?? 0),
      page: needsAggregatePagination.page,
      item_per_page: needsAggregatePagination.item_per_page,
    }),
    [yearFromUrl, needsAggregatePagination]
  )

  const {
    data: needsAggregateData,
    isLoading: isLoadingNeedsAggregate,
    isFetching: isFetchingNeedsAggregate,
  } = useBmhpApprovalNeedsAggregateTable({
    params: needsAggregateParams,
    enabled: !!yearFromUrl,
  })

  useSetLoadingPopupStore(isLoadingNeedsAggregate || isFetchingNeedsAggregate)

  // ── Screening Summary data from API ─────────────────────────────────────────────
  const screeningSummaryData = useMemo(() => {
    return {
      total: needsAggregateData?.summary?.total ?? [],
      unit: needsAggregateData?.summary?.unit ?? [],
    }
  }, [needsAggregateData?.summary])

  // ── Inject si_no for needs aggregate table ─────────────────────────────────────
  const needsAggregateDataWithNo = useMemo<TNeedsAggregateItem[]>(() => {
    const allRows = needsAggregateData?.data ?? []
    const offset =
      (needsAggregatePagination.page - 1) *
      needsAggregatePagination.item_per_page
    return allRows.map((row, idx) => ({
      ...row,
      si_no: offset + idx + 1,
    }))
  }, [needsAggregateData?.data, needsAggregatePagination.page])

  // ── Calculate total items for pagination info ───────────────────────────────────
  const totalItems = needsAggregateData?.total_item ?? 0
  const totalPages = needsAggregateData?.total_page ?? 0

  // ── Handle city selection from needs aggregate table ─────────────────────────────
  const handleCitySelect = useCallback(
    (cityId: number) => {
      const city = needsAggregateDataWithNo.find(
        (item) => item.city_id === cityId
      )
      if (city) {
        setSelectedCity({
          city_id: city.city_id,
          city_name: city.city_name,
          province_name: profile?.entity?.province?.name,
          year: yearFromUrl,
        })
        setIsDrawerOpen(true)
      }
    },
    [needsAggregateDataWithNo, profile?.entity?.province?.name, yearFromUrl]
  )

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleOpenPreview = useCallback(() => {
    setIsPreviewOpen(true)
  }, [])

  const handleClosePreview = useCallback(() => {
    setIsPreviewOpen(false)
  }, [])

  // ── Export XLS mutation ──────────────────────────────────────────────────────────
  const { mutate: exportXls, isPending: isExporting } =
    useExportNeedsAggregateXls()

  const handleExport = useCallback(() => {
    exportXls({ program_plan_id: Number(yearFromUrl ?? 0) })
  }, [exportXls, yearFromUrl])

  const needsAggregateTableColumns = useBmhpApprovalNeedsAggregateTableColumns({
    onCitySelect: handleCitySelect,
  })

  // ── Monitoring Card Buttons ────────────────────────────────────────────────────
  const monitoringCardButtons = useMemo(
    () => [
      {
        label: t('needs_aggregate.page.btn_export'),
        icon: <ArrowUpTrayIcon className="ui-w-4 ui-h-4" />,
        variant: 'secondary' as const,
        onClick: handleExport,
        disabled: isExporting,
      },
      {
        label: t('needs_aggregate.page.btn_preview'),
        variant: 'secondary' as const,
        onClick: handleOpenPreview,
      },
      {
        label: t('needs_aggregate.page.btn_see_procurement'),
        variant: 'primary' as const,
        onClick: () => {
          const basePath = `/v5/bmhp-approval-province/${yearFromUrl}`
          push(`${basePath}/procurement-recapitulation`)
        },
      },
    ],
    [yearFromUrl, push, t, handleExport, isExporting, handleOpenPreview]
  )

  return (
    <div className="ui-mt-6 ui-space-y-6">
      {/* Table 1: Screening Summary (2 rows) */}
      <div className="ui-overflow-x-auto">
        <table className="ui-w-full ui-border ui-border-neutral-200 ui-bg-white ui-rounded-lg">
          <thead>
            <tr className="ui-bg-neutral-50">
              <th className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-b ui-border-neutral-200">
                {t('needs_aggregate.screening_summary.label')}
              </th>
              {screeningSummaryData.total.map((_, idx) => {
                const label =
                  needsAggregateData?.summary?.labels?.[idx] ??
                  `Item ${idx + 1}`
                return (
                  <th
                    key={idx}
                    className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-b ui-border-neutral-200 ui-whitespace-nowrap"
                  >
                    {label}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: Total (Province) */}
            <tr className="ui-bg-white hover:ui-bg-neutral-50">
              <td className="ui-p-4 ui-text-sm ui-font-medium ui-text-neutral-800 ui-border-b ui-border-neutral-200">
                {t('needs_aggregate.page.row_total_province')}
              </td>
              {screeningSummaryData.total.map((total, idx) => (
                <td
                  key={idx}
                  className="ui-p-4 ui-text-sm ui-text-center ui-text-neutral-700 ui-border-b ui-border-neutral-200"
                >
                  {total.toLocaleString('id-ID')}
                </td>
              ))}
            </tr>
            {/* Row 2: Unit */}
            <tr className="ui-bg-neutral-50 hover:ui-bg-neutral-100">
              <td className="ui-p-4 ui-text-sm ui-font-medium ui-text-neutral-800 ui-border-b ui-border-neutral-200">
                {t('needs_aggregate.page.row_unit')}
              </td>
              {screeningSummaryData.unit.map((unit, idx) => (
                <td
                  key={idx}
                  className="ui-p-4 ui-text-sm ui-text-center ui-text-neutral-700 ui-border-b ui-border-neutral-200"
                >
                  {unit || '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Card: Table 2 - Needs Aggregate Table */}
      <MonitoringCard
        title={t('needs_aggregate.page.card_title')}
        buttons={monitoringCardButtons}
        tableContainerClassName="ui-p-5"
      >
        <DataTable
          data={needsAggregateDataWithNo}
          columns={needsAggregateTableColumns}
          isLoading={isLoadingNeedsAggregate || isFetchingNeedsAggregate}
          isSticky
          stickyColumns={[0, 1]}
        />

        <PaginationContainer className="ui-mt-4">
          <PaginationSelectLimit
            size={needsAggregatePagination.item_per_page}
            onChange={(limit) =>
              setNeedsAggregatePagination({ page: 1, item_per_page: limit })
            }
            perPagesOptions={needsAggregateData?.list_pagination}
          />
          <PaginationInfo
            size={needsAggregatePagination.item_per_page}
            currentPage={needsAggregatePagination.page}
            total={totalItems}
          />
          <Pagination
            totalPages={totalPages}
            currentPage={needsAggregatePagination.page}
            onPageChange={(page) => setNeedsAggregatePagination({ page })}
          />
        </PaginationContainer>
      </MonitoringCard>

      {/* Review Needs Drawer */}
      <ReviewNeedsDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedCity}
      />

      {/* Preview Drawer */}
      <PreviewDrawer
        open={isPreviewOpen}
        onClose={handleClosePreview}
        programPlanId={Number(yearFromUrl ?? 0)}
      />
    </div>
  )
}

// ── Wrapped with tabs ─────────────────────────────────────────────────────────

const BmhpApprovalNeedsAggregatePage: React.FC = () => {
  return (
    <BmhpApprovalProvinceTabs>
      <BmhpApprovalNeedsAggregatePageContent />
    </BmhpApprovalProvinceTabs>
  )
}

export default BmhpApprovalNeedsAggregatePage
