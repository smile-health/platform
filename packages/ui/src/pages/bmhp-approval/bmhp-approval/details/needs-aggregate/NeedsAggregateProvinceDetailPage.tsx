'use client'

import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'
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
import useSmileRouter from '#hooks/useSmileRouter'
import { useProfile } from '#shared/auth'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import BmhpApprovalProvinceDetailTabs from '../../components/BmhpApprovalProvinceDetailTabs'
import BmhpApprovalProvinceDetailContext from '../../tabs/province-completeness/libs/bmhp-approval-province-detail.context'
import { useBmhpApprovalNeedsAggregateTable } from '../../tabs/needs-aggregate/hooks/useBmhpApprovalNeedsAggregateTable'
import { useBmhpApprovalNeedsAggregateTableColumns } from '../../tabs/needs-aggregate/hooks/useBmhpApprovalNeedsAggregateTableColumns'
import { useExportNeedsAggregateXls } from '../../tabs/needs-aggregate/hooks/useNeedsAggregateOperations'
import ReviewNeedsDrawer from '../../tabs/needs-aggregate/components/ReviewNeedsDrawer'
import { TNeedsAggregateItem } from '../../tabs/needs-aggregate/libs/needs-aggregate.types'

// ── Page Content ──────────────────────────────────────────────────────────────

const NeedsAggregateProvinceDetailPageContent: React.FC = () => {
  const { t } = useTranslation('bmhpApproval')
  const { query } = useSmileRouter()
  const yearFromUrl = query.year_id ? Number(query.year_id) : undefined
  const { data: profile } = useProfile()
  const { approvalData } = useContext(BmhpApprovalProvinceDetailContext)

  const programPlanId = approvalData?.id ?? 0
  const isReady = !!programPlanId

  // ── Drawer state ─────────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<{
    city_name: string
    province_name?: string
    year?: number
  } | null>(null)

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Query params ──────────────────────────────────────────────────────────────
  const params = useMemo(
    () => ({
      program_plan_id: programPlanId,
      page: pagination.page,
      item_per_page: pagination.item_per_page,
    }),
    [programPlanId, pagination]
  )

  const {
    data,
    isLoading,
    isFetching,
  } = useBmhpApprovalNeedsAggregateTable({
    params,
    enabled: isReady,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Inject si_no ──────────────────────────────────────────────────────────────
  const dataWithNo = useMemo<TNeedsAggregateItem[]>(() => {
    const rows = data?.data ?? []
    const offset = (pagination.page - 1) * pagination.item_per_page
    return rows.map((row, idx) => ({
      ...row,
      si_no: offset + idx + 1,
    }))
  }, [data, pagination])

  // ── Handle city selection ─────────────────────────────────────────────────────
  const handleCitySelect = useCallback((cityId: number) => {
    const city = dataWithNo.find((item) => item.city_id === cityId)
    if (city) {
      setSelectedCity({
        city_name: city.city_name,
        province_name: profile?.entity?.province?.name,
        year: yearFromUrl,
      })
      setIsDrawerOpen(true)
    }
  }, [dataWithNo, profile?.entity?.province?.name, yearFromUrl])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  // ── Export XLS mutation ──────────────────────────────────────────────────────────
  const { mutate: exportXls, isPending: isExporting } =
    useExportNeedsAggregateXls()

  const handleExport = useCallback(() => {
    exportXls({ program_plan_id: programPlanId })
  }, [exportXls, programPlanId])

  const tableColumns = useBmhpApprovalNeedsAggregateTableColumns({
    onCitySelect: handleCitySelect,
  })



  const pageOffsetRef = useRef(0)
  pageOffsetRef.current = (pagination.page - 1) * pagination.item_per_page


  return (
    <div className="ui-mt-6 ui-space-y-4">
      <div className="ui-bg-white ui-border ui-border-gray-200 ui-rounded-lg ui-p-4 ui-space-y-4">
        {/* Table header row */}
        <div className="ui-flex ui-items-center ui-justify-between">
          <h3 className="ui-text-base ui-font-semibold ui-text-dark-blue">
            {t('needs_aggregate.page.card_title')}
          </h3>
          <Button
            variant="outline"
            color="primary"
            leftIcon={<Export className="ui-size-5" />}
            onClick={handleExport}
            isLoading={isExporting}
            disabled={isExporting}
          >
            {t('needs_aggregate.page.btn_export')}
          </Button>
        </div>

        {/* Table */}
        <DataTable
          withBorder
          id="needsAggregateProvinceDetailTable"
          data={dataWithNo}
          columns={tableColumns}
          isLoading={isLoading || isFetching}
          isSticky
          stickyColumns={[0, 1]}
          getRowId={(_, index) => String(pageOffsetRef.current + index)}
        />

        {/* Pagination */}
        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.item_per_page}
            onChange={(limit) =>
              setPagination({ page: 1, item_per_page: limit })
            }
            perPagesOptions={data?.list_pagination}
          />
          <PaginationInfo
            size={pagination.item_per_page}
            currentPage={pagination.page}
            total={data?.total_item ?? 0}
          />
          <Pagination
            totalPages={data?.total_page ?? 0}
            currentPage={pagination.page}
            onPageChange={(page) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>

      {/* Review Needs Drawer */}
      <ReviewNeedsDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedCity}
      />
    </div>
  )
}

// ── Wrapped with province detail tabs ─────────────────────────────────────────

const NeedsAggregateProvinceDetailPage: React.FC = () => {
  return (
    <BmhpApprovalProvinceDetailTabs>
      <NeedsAggregateProvinceDetailPageContent />
    </BmhpApprovalProvinceDetailTabs>
  )
}

export default NeedsAggregateProvinceDetailPage

