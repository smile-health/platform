import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { KFA_LEVEL } from '#constants/material'
import { useSetExportPopupStore } from '#hooks/useSetExportPopup'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProgramStorage } from '#utils/storage/program'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  exportReconciliation,
  getListReconciliation,
} from '../reconciliation-list.service'
import { reconciliationFilterSchema } from '../schema/ReconciliationFilterSchema'
import { reconciliationTableSchema } from '../schema/ReconciliationTableSchema'

export const useReconciliationList = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['reconciliation'])

  const { t: tDashboard } = useTranslation('dashboard')

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )
  const program = getProgramStorage()
  const router = useSmileRouter()
  const filterSchema = useMemo<UseFilter>(
    () =>
      reconciliationFilterSchema({
        t,
        tDashboard,
        program: program,
      }),
    [t, tDashboard, program]
  )
  const filter = useFilter(filterSchema)
  const schemaTable = reconciliationTableSchema({
    t,
    locale: language,
    page: pagination.page,
    size: pagination.paginate,
  })
  const { query } = filter
  const baseParams = {
    start_date: query.period?.start?.toString(),
    end_date: query.period?.end?.toString(),
    created_from: query.created_date?.start?.toString(),
    created_to: query.created_date?.end?.toString(),
    activity_id: query.activity_id?.value,
    material_type_id: query.material_type_id?.value,
    ...(Number(query?.material_level_id?.value) === KFA_LEVEL.KFA_92.id &&
    program?.config?.material?.is_hierarchy_enabled
      ? { parent_material_id: query?.material_id?.value }
      : { material_id: query?.material_id?.value }),
    entity_id: query?.entity_id?.value,
    entity_tag_id: query?.entity_tag_id?.value,
    regency_id: query?.regency_id?.value,
    province_id: query?.province_id?.value,
  }
  const listParams = { ...pagination, ...baseParams }
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['list-reconciliation', listParams, language],
    queryFn: () => getListReconciliation(listParams),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady && Object.values(filter.query).some((item) => !!item),
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const queryKeyExport = ['reconciliation-export', baseParams]
  const exportQuery = useQuery({
    queryKey: queryKeyExport,
    queryFn: () => exportReconciliation(baseParams),
    enabled: false,
  })

  useSetExportPopupStore(exportQuery.isSuccess, queryKeyExport)

  const handleSearch = () => {
    setPagination({ page: 1 })
  }

  const handleReset = () => {
    filter.reset()
  }

  return {
    pagination,
    setPagination,
    filter: {
      ...filter,
      reset: handleReset,
    },
    schemaTable,
    data,
    isLoading: isLoading || isFetching,
    handleChangeLimit,
    exportQuery,
    handleSearch,
  }
}
