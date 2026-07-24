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
import ReviewTargetDrawer from './components/ReviewTargetDrawer'
import { useBmhpApprovalProvinceTable } from './hooks/useBmhpApprovalProvinceTable'
import { useBmhpApprovalProvinceTableColumns } from './hooks/useBmhpApprovalProvinceTableColumns'
import { TProvinceItem } from './libs/bmhp-approval-province-completeness.type'

// ── Screening Types for Table 1 ─────────────────────────────────────────────────

const SCREENING_TYPES = [
  'Skrining Tuberkulosis',
  'Skrining Diabetes Melitus',
  'Skrining Patitis',
  'Skrining Anemia',
  'Skrining Malaria',
  'Skrining HIV & Sifilis',
  'Skrining Gigi',
  'Skrining Fungsi Ginjal',
] as const

// ── Page ──────────────────────────────────────────────────────────────────────

const BmhpApprovalProvinceCompletenessPageContent: React.FC = () => {
  const { t } = useTranslation('bmhpApproval')
  const { query, push } = useSmileRouter()
  const yearFromUrl = query.year_id ? Number(query.year_id) : undefined
  const { data: profile } = useProfile()

  // ── Drawer state ───────────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<{
    city_name: string
    province_name?: string
    year?: number
  } | null>(null)

  // ── Pagination for province table ────────────────────────────────────────────
  const [provincePagination, setProvincePagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Province table params ────────────────────────────────────────────────────
  const provinceParams = useMemo(
    () => ({
      year: yearFromUrl ?? 0,
      province_id: Number(profile?.entity?.province?.id ?? 0),
      page: provincePagination.page,
      item_per_page: provincePagination.item_per_page,
    }),
    [yearFromUrl, profile?.entity?.province?.id, provincePagination]
  )

  const {
    data: provinceData,
    isLoading: isLoadingProvince,
    isFetching: isFetchingProvince,
  } = useBmhpApprovalProvinceTable({
    params: provinceParams,
    enabled: !!yearFromUrl,
  })

  useSetLoadingPopupStore(isLoadingProvince || isFetchingProvince)

  // ── Mock data for Table 1 (Screening Summary) ─────────────────────────────────
  const screeningSummaryData = useMemo(() => {
    return {
      label: 'Total (Provinsi)',
      totals: SCREENING_TYPES.map(() => Math.floor(Math.random() * 1000)),
    }
  }, [])

  // ── Inject si_no for province table ───────────────────────────────────────────
  const provinceDataWithNo = useMemo<TProvinceItem[]>(() => {
    const rows = provinceData?.data ?? []
    const offset =
      (provincePagination.page - 1) * provincePagination.item_per_page
    return rows.map((row, idx) => ({
      ...row,
      si_no: offset + idx + 1,
    }))
  }, [provinceData, provincePagination])

  // ── Handle city selection from province table ─────────────────────────────────
  const handleCitySelect = useCallback(
    (cityId: number) => {
      const city = provinceDataWithNo.find((item) => item.city_id === cityId)
      if (city) {
        setSelectedCity({
          city_name: city.city_name,
          province_name: profile?.entity?.province?.name,
          year: yearFromUrl,
        })
        setIsDrawerOpen(true)
      }
    },
    [provinceDataWithNo, profile?.entity?.province?.name, yearFromUrl]
  )

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const provinceTableColumns = useBmhpApprovalProvinceTableColumns({
    onCitySelect: handleCitySelect,
  })

  // ── Monitoring Card Buttons ────────────────────────────────────────────────────
  const monitoringCardButtons = useMemo(
    () => [
      {
        label: t('province_completeness.page.btn_export'),
        icon: <ArrowUpTrayIcon className="ui-w-4 ui-h-4" />,
        variant: 'secondary' as const,
      },
      {
        label: t('province_completeness.page.btn_preview'),
        variant: 'secondary' as const,
      },
      {
        label: t('province_completeness.page.btn_see_needs_aggregate'),
        variant: 'primary' as const,
        onClick: () => {
          const basePath = `/v5/bmhp-approval-province/${yearFromUrl}`
          push(`${basePath}/needs-aggregate`)
        },
      },
    ],
    [yearFromUrl, push, t]
  )

  return (
    <div className="ui-mt-6 ui-space-y-6">
      {/* Table 1: Screening Summary (using shared component) */}
      <ScreeningSummaryTable
        data={screeningSummaryData}
        screeningTypes={SCREENING_TYPES}
        rowLabel={t('province_completeness.screening_summary.total_province')}
      />

      {/* Card: Table 2 - Monitoring Table (using shared component) */}
      <MonitoringCard
        title={t('province_completeness.page.card_title')}
        buttons={monitoringCardButtons}
        tableContainerClassName="ui-p-5"
      >
        <DataTable
          data={provinceDataWithNo}
          columns={provinceTableColumns}
          isLoading={isLoadingProvince || isFetchingProvince}
          isSticky
          stickyColumns={[0, 1]}
        />

        <PaginationContainer className="ui-mt-4">
          <PaginationSelectLimit
            size={provincePagination.item_per_page}
            onChange={(limit) =>
              setProvincePagination({ page: 1, item_per_page: limit })
            }
            perPagesOptions={provinceData?.list_pagination}
          />
          <PaginationInfo
            size={provincePagination.item_per_page}
            currentPage={provincePagination.page}
            total={provinceData?.total_item}
          />
          <Pagination
            totalPages={provinceData?.total_page ?? 0}
            currentPage={provincePagination.page}
            onPageChange={(page) => setProvincePagination({ page })}
          />
        </PaginationContainer>
      </MonitoringCard>

      {/* Review Target Drawer */}
      <ReviewTargetDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        data={selectedCity}
      />
    </div>
  )
}

// ── Wrapped with tabs ─────────────────────────────────────────────────────────

const BmhpApprovalProvinceCompletenessPage: React.FC = () => {
  return (
    <BmhpApprovalProvinceTabs>
      <BmhpApprovalProvinceCompletenessPageContent />
    </BmhpApprovalProvinceTabs>
  )
}

export default BmhpApprovalProvinceCompletenessPage
