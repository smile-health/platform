'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  UseFilter,
  useFilter,
} from '#components/filter'
import Export from '#components/icons/Export'
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

import BmhpApprovalTabs from '../BmhpApprovalTabs'
import { useCompletenessMonitoring } from './hooks/useCompletenessMonitoring'
import { useCompletenessTableColumns } from './hooks/useCompletenessTableColumns'
import { completenessMonitoringFilterSchema } from './libs/completeness-monitoring.filter'
import {
  CompletenessMonitoringParams,
  TCompletenessItem,
  TExaminationColumn,
} from './libs/completeness-monitoring.type'
import { exportCompletenessMonitoring } from './services/completeness-monitoring.service'

// ── Page ──────────────────────────────────────────────────────────────────────

const CompletenessMonitoringPageContent: React.FC = () => {
  const { t } = useTranslation(['bmhpApproval', 'common'])
  const { query, push } = useSmileRouter()
  const yearFromUrl = query.year_id ? Number(query.year_id) : undefined
  const routerPath = `/v5/bmhp-approval/${yearFromUrl}`
  const idFromUrl = query.year_id ? Number(query.year_id) : undefined
  const { data: profile } = useProfile()

  // ── Applied filters (only update on filter submit) ─────────────────────────
  const [appliedFilters, setAppliedFilters] = useState({
    examinationIds: undefined as string | undefined,
    entityIds: undefined as string | undefined,
    showNotSubmitted: undefined as number | undefined,
  })

  // ── State for export ───────────────────────────────────────────────────────
  const [isExporting, setIsExporting] = useState(false)

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Filter schema ──────────────────────────────────────────────────────────
  const filterSchema = useMemo<UseFilter>(
    () =>
      completenessMonitoringFilterSchema({
        regencyId: profile?.entity?.regency?.id,
        programPlanId: idFromUrl,
        t: t as any,
      }),
    [idFromUrl, profile?.entity?.regency?.id, t]
  )
  const filter = useFilter(filterSchema)

  // ── Query params ───────────────────────────────────────────────────────────
  const params = useMemo<CompletenessMonitoringParams>(
    () => ({
      program_plan_id: idFromUrl ?? 0,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      entity_ids: appliedFilters.entityIds || undefined,
      examination_ids: appliedFilters.examinationIds || undefined,
      not_submitted: appliedFilters.showNotSubmitted === 1 ? 1 : undefined,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [
      idFromUrl,
      query.regency_id,
      appliedFilters.entityIds,
      appliedFilters.examinationIds,
      appliedFilters.showNotSubmitted,
      pagination,
    ]
  )

  const { data, isLoading, isFetching } = useCompletenessMonitoring({
    params,
    enabled: !!idFromUrl,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterSubmit = useCallback(() => {
    const examinationValues = filter.getValues('examination_ids')
    const entityValues = filter.getValues('entity_ids')
    const showNotSub = filter.getValues('show_not_submitted')

    setAppliedFilters({
      examinationIds: Array.isArray(examinationValues)
        ? examinationValues.map((v: any) => v.value).join(',')
        : undefined,
      entityIds: Array.isArray(entityValues)
        ? entityValues.map((v: any) => v.value).join(',')
        : undefined,
      showNotSubmitted: typeof showNotSub === 'number' ? showNotSub : undefined,
    })

    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({
      examinationIds: undefined,
      entityIds: undefined,
      showNotSubmitted: undefined,
    })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportCompletenessMonitoring({
        program_plan_id: idFromUrl ?? 0,
        entity_ids: appliedFilters.entityIds || undefined,
        examination_ids: appliedFilters.examinationIds || undefined,
        not_submitted: appliedFilters.showNotSubmitted === 1 ? 1 : undefined,
      })
    } finally {
      setIsExporting(false)
    }
  }, [
    idFromUrl,
    appliedFilters.entityIds,
    appliedFilters.examinationIds,
    appliedFilters.showNotSubmitted,
  ])

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
      examinationColumns: Array.from(columnMap.values()),
    }
  }, [data, pagination.page, pagination.item_per_page])

  const tableColumns = useCompletenessTableColumns(examinationColumns)

  // ── Pagination logic ───────────────────────────────────────────────────────
  const totalItems = data?.total_item ?? 0
  const totalPages = data?.total_page ?? 0

  return (
    <div className="ui-mt-6 ui-space-y-4">
      {/* Standard Filter */}
      <FilterFormRoot
        collapsible
        onSubmit={(e) => {
          filter.handleSubmit(e)
          handleFilterSubmit()
        }}
      >
        <FilterFormBody className="ui-grid-cols-3">
          {filter.renderField()}
        </FilterFormBody>
        <FilterFormFooter>
          <div className="ui-flex ui-gap-2 ui-ml-auto">
            <Button
              id="btn-export"
              type="button"
              variant="subtle"
              leftIcon={<Export className="ui-size-5" />}
              loading={isExporting}
              disabled={isExporting}
              onClick={handleExport}
            >
              {t('common:export')}
            </Button>
            <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
            <FilterResetButton onClick={handleFilterReset} variant="subtle" />
            <FilterSubmitButton
              className="ui-w-[202px]"
              variant="outline"
              text={t('common:search')}
            />
          </div>
        </FilterFormFooter>
        {filter.renderActiveFilter()}
      </FilterFormRoot>

      {/* Table header row */}
      <div className="ui-border ui-p-5 ui-space-y-4">
        <div className="ui-flex ui-items-center ui-justify-between">
          <h5 className="ui-text-base ui-font-semibold">
            {t('bmhpApproval:completeness.health_care_list')}
          </h5>
          <Button
            type="button"
            variant="solid"
            color="primary"
            onClick={() => {
              push(`${routerPath}/target-and-adjustment`)
            }}
          >
            {t('bmhpApproval:completeness.verify_target')}
          </Button>
        </div>

        {/* Table */}
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
    </div>
  )
}

// ── Wrapped with tabs ─────────────────────────────────────────────────────────

const CompletenessMonitoringPage: React.FC = () => {
  return (
    <BmhpApprovalTabs>
      <CompletenessMonitoringPageContent />
    </BmhpApprovalTabs>
  )
}

export default CompletenessMonitoringPage
