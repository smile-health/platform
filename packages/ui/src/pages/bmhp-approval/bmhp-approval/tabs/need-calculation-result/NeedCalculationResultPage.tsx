'use client'

import React, { useCallback, useMemo, useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
  useFilter,
} from '#components/filter'
import EmptyFilter from '#components/icons/EmptyFilter'
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
import { numberFormatter } from '#utils/formatter'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { listBmhpMaterial } from '../../../../bmhp/bmhp-material/list/master.service'
import BmhpApprovalTabs from '../BmhpApprovalTabs'
import { useNeedCalculationResult } from './hooks/useNeedCalculationResult'
import { TNeedCalculationResultItem } from './libs/need-calculation-result.type'
import {
  exportMaterialNeeds,
  loadMaterialNeedsEntities,
} from './services/need-calculation-result.service'

// ── Unique material group (column group) ──────────────────────────────────────
type TMaterialGroup = {
  material_name: string
}

type TMaterialRow = {
  material_name: string
  material_variant: string
  unit: string
  total_needed: number
  type: string
}

// Key = material_name (unique label for column group)
type TScreeningMap = Map<string, TMaterialRow[]>

// ── Derive table data grouped by material_name (prevents duplicate headers) ───
function deriveTableData(
  data: TNeedCalculationResultItem[],
  startNo: number
): {
  materialGroups: TMaterialGroup[]
  rows: {
    puskesmas_id: number
    puskesmas_name: string
    sub_district_name: string
    si_no: number
    screeningMap: TScreeningMap
    maxMaterials: number
  }[]
} {
  // Collect unique material names (preserving first-seen order)
  const seenNames = new Set<string>()
  const materialGroups: TMaterialGroup[] = []

  data.forEach((item) => {
    item.screenings.forEach((s) => {
      if (!seenNames.has(s.material_name)) {
        seenNames.add(s.material_name)
        materialGroups.push({ material_name: s.material_name })
      }
    })
  })

  const rows = data.map((item, i) => {
    // Accumulate all variants under the same material_name key
    const screeningMap: TScreeningMap = new Map()

    item.screenings.forEach((s) => {
      const existing = screeningMap.get(s.material_name) ?? []
      const newItems = s.materials.map((m) => ({
        material_name: m.material_name,
        material_variant: m.material_variant,
        unit: m.unit,
        total_needed: m.total_needed,
        type: m.type ?? 'Screening',
      }))
      screeningMap.set(s.material_name, [...existing, ...newItems])
    })

    const maxMaterials = Math.max(
      1,
      ...Array.from(screeningMap.values()).map((ms) => ms.length)
    )

    return {
      puskesmas_id: item.puskesmas_id,
      puskesmas_name: item.puskesmas_name,
      sub_district_name: item.sub_district_name,
      si_no: startNo + i,
      screeningMap,
      maxMaterials,
    }
  })
  
  return { materialGroups, rows }
}

// ── Page content ──────────────────────────────────────────────────────────────

const NeedCalculationResultPageContent: React.FC = () => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  // const { approvalData } = useContext(BmhpApprovalDetailContext)
  const { query, push } = useSmileRouter()
  const idFromUrl = query.year_id ? Number(query.year_id) : undefined
  const { data: profile } = useProfile()

  const [appliedFilters, setAppliedFilters] = useState({
    materialId: undefined as number | undefined,
    entityId: undefined as number | undefined,
  })

  const [isExporting, setIsExporting] = useState(false)

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      item_per_page: parseAsInteger.withDefault(10),
    },
    { history: 'push' }
  )

  // ── Filter schema ──────────────────────────────────────────────────────────
  const filterSchema = useMemo(
    () => [
      {
        id: 'need_calc_material_filter',
        type: 'select-async-paginate' as const,
        name: 'material',
        label: t('bmhpApproval:need_calculation.filter_material'),
        placeholder: t(
          'bmhpApproval:need_calculation.filter_material_placeholder'
        ),
        defaultValue: null,
        required: true,
        loadOptions: async (
          search: string,
          _: unknown,
          additional: { page: number }
        ) => {
          const result = await listBmhpMaterial({
            page: additional?.page || 1,
            paginate: 50,
            keyword: search || undefined,
            program_plan_id: idFromUrl,
          })
          return {
            options:
              result?.data?.map((item: { id: number; name: string }) => ({
                value: item.id,
                label: item.name,
              })) ?? [],
            hasMore: (result?.data?.length ?? 0) >= 50,
            additional: { page: (additional?.page || 1) + 1 },
          }
        },
        additional: { page: 1 },
      },
      {
        id: 'need_calc_entity_filter',
        type: 'select-async-paginate' as const,
        name: 'entity',
        label: t('bmhpApproval:need_calculation.filter_entity'),
        placeholder: t(
          'bmhpApproval:need_calculation.filter_entity_placeholder'
        ),
        defaultValue: null,
        loadOptions: async (
          search: string,
          _: unknown,
          additional: { page: number }
        ) => {
          return loadMaterialNeedsEntities(search, _, {
            regency_ids: profile?.entity?.regency?.id,
            entity_tag_ids: 9,
            ...additional,
          })
        },
        additional: { page: 1 },
      },
    ],
    [t, profile?.entity?.regency?.id, idFromUrl]
  )

  const filter = useFilter(filterSchema)

  const params = useMemo(
    () => ({
      program_plan_id: idFromUrl ?? 0,
      ...(query.regency_id ? { regency_id: Number(query.regency_id) } : {}),
      entity_id: appliedFilters.entityId,
      material_id: appliedFilters.materialId,
      page: pagination.page,
      paginate: pagination.item_per_page,
    }),
    [idFromUrl, query.regency_id, appliedFilters, pagination]
  )

  const hasMaterialFilter = !!appliedFilters.materialId

  const { data, isLoading, isFetching } = useNeedCalculationResult({
    params,
    enabled: !!idFromUrl && hasMaterialFilter,
  })

  useSetLoadingPopupStore(isLoading || isFetching)

  // ── Filter handlers ────────────────────────────────────────────────────────
  const handleFilterSubmit = useCallback(() => {
    setAppliedFilters({
      materialId: filter.getValues('material')?.value ?? undefined,
      entityId: filter.getValues('entity')?.value ?? undefined,
    })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleFilterReset = useCallback(() => {
    filter.reset()
    setAppliedFilters({
      materialId: undefined,
      entityId: undefined,
    })
    setPagination({ page: 1 })
  }, [filter, setPagination])

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportMaterialNeeds({
        program_plan_id: idFromUrl ?? 0,
        entity_id: appliedFilters.entityId,
        material_id: appliedFilters.materialId,
      })
    } finally {
      setIsExporting(false)
    }
  }, [idFromUrl, appliedFilters])

  // ── Derive table data (per examination) ───────────────────────────────────
  const offset = (pagination.page - 1) * pagination.item_per_page
  const { materialGroups, rows: tableRows } = useMemo(
    () => deriveTableData(data?.data ?? [], offset + 1),
    [data, offset]
  )

  const totalItem = data?.total_item ?? 0
  const listPagination = data?.list_pagination ?? [10, 25, 50, 100]

  return (
    <div className="ui-mt-6 ui-space-y-4">
      {/* Filter */}
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
              disabled={isExporting || !hasMaterialFilter}
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

      {/* Table header + table + pagination in bordered container */}
      <div className="ui-border ui-p-5 ui-space-y-4">
        {/* Table header */}
        <div className="ui-flex ui-items-center ui-justify-between">
          <h5 className="ui-font-semibold ui-text-base">
            {t('bmhpApproval:need_calculation.table_title')}
          </h5>
          <Button
            type="button"
            variant="solid"
            color="primary"
            onClick={() =>
              push(`/v5/bmhp-approval/${idFromUrl}/procurement-recapitulation`)
            }
          >
            {t('bmhpApproval:button.see_procurement')}
          </Button>
        </div>

        {/* Custom table */}
        <div className="ui-w-full ui-overflow-x-auto ui-border ui-border-gray-200 ui-rounded">
          <table className="ui-w-full ui-text-sm ui-border-collapse">
            <thead>
              {/* Row 1: No + Puskesmas (rowSpan=2) + material names (colSpan=5) */}
              <tr className="ui-bg-gray-50 ui-border-b ui-border-gray-200">
                <th
                  className="ui-px-3 ui-py-3 ui-text-center ui-font-semibold ui-text-gray-700 ui-sticky ui-left-0 ui-bg-gray-50"
                  rowSpan={2}
                  style={{
                    minWidth: 60,
                    width: 60,
                    maxWidth: 60,
                    boxShadow: 'inset -1px 0 0 0 #e5e7eb',
                    zIndex: 22,
                  }}
                >
                  {t('bmhpApproval:need_calculation.col_no')}
                </th>
                <th
                  className="ui-px-3 ui-py-3 ui-text-left ui-font-semibold ui-text-gray-700 ui-sticky ui-bg-gray-50"
                  rowSpan={2}
                  style={{
                    minWidth: 250,
                    width: 250,
                    maxWidth: 250,
                    left: 60,
                    boxShadow: 'inset -1px 0 0 0 #e5e7eb',
                    zIndex: 21,
                  }}
                >
                  {t('bmhpApproval:need_calculation.col_health_care')}
                </th>
                {materialGroups.map((mg) => (
                  <th
                    key={mg.material_name}
                    className="ui-px-3 ui-py-2 ui-text-center ui-font-semibold ui-text-gray-700 ui-border-b ui-border-r ui-border-gray-200"
                    colSpan={5}
                  >
                    {mg.material_name}
                  </th>
                ))}
              </tr>
              {/* Row 2: sub-columns per material */}
              <tr className="ui-bg-gray-50 ui-border-b ui-border-gray-200">
                {materialGroups.map((mg) => (
                  <React.Fragment key={mg.material_name}>
                    <th
                      className="ui-px-3 ui-py-2 ui-text-left ui-font-semibold ui-text-gray-700 ui-border-r ui-border-gray-200"
                      style={{ minWidth: 100 }}
                    >
                      {t('bmhpApproval:need_calculation.col_type')}
                    </th>
                    <th
                      className="ui-px-3 ui-py-2 ui-text-left ui-font-semibold ui-text-gray-700 ui-border-r ui-border-gray-200"
                      style={{ minWidth: 160 }}
                    >
                      {t('bmhpApproval:need_calculation.col_product_template')}
                    </th>
                    <th
                      className="ui-px-3 ui-py-2 ui-text-left ui-font-semibold ui-text-gray-700 ui-border-r ui-border-gray-200"
                      style={{ minWidth: 160 }}
                    >
                      {t('bmhpApproval:need_calculation.col_product_variant')}
                    </th>
                    <th
                      className="ui-px-3 ui-py-2 ui-text-center ui-font-semibold ui-text-gray-700 ui-border-r ui-border-gray-200"
                      style={{ minWidth: 90 }}
                    >
                      {t('bmhpApproval:need_calculation.col_needs_quantity')}
                    </th>
                    <th
                      className="ui-px-3 ui-py-2 ui-text-center ui-font-semibold ui-text-gray-700 ui-border-r ui-border-gray-200"
                      style={{ minWidth: 70 }}
                    >
                      {t('bmhpApproval:need_calculation.col_unit')}
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && !isLoading && !isFetching ? (
                <tr>
                  <td
                    colSpan={2 + materialGroups.length * 5}
                    className="ui-w-full ui-h-96"
                  >
                    {!hasMaterialFilter ? (
                      <EmptyState
                        withIcon
                        emptyIcon={<EmptyFilter className="ui-size-6" />}
                        title={t('common:no_filter_selected')}
                        description={t('common:please_apply_filter')}
                      />
                    ) : (
                      <EmptyState
                        withIcon
                        title={t('common:message.empty.title')}
                        description={t('common:message.empty.description')}
                      />
                    )}
                  </td>
                </tr>
              ) : (
                tableRows.flatMap((row) =>
                  Array.from({ length: row.maxMaterials }, (_, mi) => (
                    <tr
                      key={`${row.puskesmas_id}-${mi}`}
                      className="ui-border-b ui-border-gray-100 hover:ui-bg-gray-50 group"
                    >
                      {/* Puskesmas info on first row */}
                      {mi === 0 && (
                        <>
                          <td
                            className="ui-px-3 ui-py-3 ui-text-center ui-text-neutral-500 ui-align-top ui-sticky ui-left-0 ui-bg-white group-hover:ui-bg-gray-50"
                            rowSpan={row.maxMaterials}
                            style={{
                              minWidth: 60,
                              width: 60,
                              maxWidth: 60,
                              boxShadow: 'inset -1px 0 0 0 #e5e7eb',
                              zIndex: 12,
                            }}
                          >
                            {row.si_no}
                          </td>
                          <td
                            className="ui-px-3 ui-py-3 ui-align-top ui-sticky ui-bg-white group-hover:ui-bg-gray-50"
                            rowSpan={row.maxMaterials}
                            style={{
                              minWidth: 250,
                              width: 250,
                              maxWidth: 250,
                              left: 60,
                              boxShadow: 'inset -1px 0 0 0 #e5e7eb',
                              zIndex: 11,
                            }}
                          >
                            <div className="ui-font-semibold ui-text-gray-900">
                              {row.puskesmas_name}
                            </div>
                            {row.sub_district_name && (
                              <div className="ui-text-xs ui-text-neutral-400 ui-mt-0.5">
                                {row.sub_district_name}
                              </div>
                            )}
                          </td>
                        </>
                      )}
                      
                      {/* Cells for each material group */}
                      {materialGroups.map((mg) => {
                        const materials = row.screeningMap.get(mg.material_name) ?? []
                        const m = materials[mi]
                        
                        return (
                          <React.Fragment key={mg.material_name}>
                            <td className="ui-px-3 ui-py-2 ui-text-gray-700 ui-border-r ui-border-gray-200">
                              {m?.type ?? ''}
                            </td>
                            <td className="ui-px-3 ui-py-2 ui-text-gray-700 ui-border-r ui-border-gray-200">
                              {m?.material_name ?? ''}
                            </td>
                            <td className="ui-px-3 ui-py-2 ui-text-gray-700 ui-border-r ui-border-gray-200">
                              {m ? m.material_variant || '-' : ''}
                            </td>
                            <td className="ui-px-3 ui-py-2 ui-text-center ui-font-semibold ui-text-gray-900 ui-border-r ui-border-gray-200">
                              {m ? numberFormatter(m.total_needed, i18n.language) : ''}
                            </td>
                            <td className="ui-px-3 ui-py-2 ui-text-center ui-text-gray-600 ui-border-r ui-border-gray-200">
                              {m?.unit ?? ''}
                            </td>
                          </React.Fragment>
                        )
                      })}
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>

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
            totalPages={data?.total_page ?? 1}
            onPageChange={(page: number) => setPagination({ page })}
          />
        </PaginationContainer>
      </div>
    </div>
  )
}

// ── Wrapped with tabs ─────────────────────────────────────────────────────────

const NeedCalculationResultPage: React.FC = () => {
  return (
    <BmhpApprovalTabs>
      <NeedCalculationResultPageContent />
    </BmhpApprovalTabs>
  )
}

export default NeedCalculationResultPage
