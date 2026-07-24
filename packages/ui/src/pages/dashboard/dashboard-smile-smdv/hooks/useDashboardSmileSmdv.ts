import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { useProgram } from '#hooks/program/useProgram'
import { useTranslation } from 'react-i18next'

import {
  DefaultDashboardSelection,
  TableType,
} from '../dashboard-smile-smdv.constant'
import { handleFilter } from '../dashboard-smile-smdv.helper'
import {
  exportDashboardReport,
  getSmileVsSmdvEntities,
  getSmileVsSmdvMaterials,
  getSmileVsSmdvSummary,
} from '../dashboard-smile-smdv.service'
import dashboardSmileSmdvFilterSchema from '../schemas/dashboardSmileSmdvFilterSchema'

export function useDashboardSmileSmdv() {
  const {
    t,
    i18n: { language },
  } = useTranslation('dashboardSmileSmdv')
  const { t: tOrder } = useTranslation(['common', 'order', 'orderList'])
  const { t: tDashboard } = useTranslation('dashboard')

  const [showInformation, setShowInformation] = useState(false)
  const [defaultDashboard, setDefaultDashboard] = useState(
    DefaultDashboardSelection.SMDV_VS_SMILE
  )
  const [activeTab, setActiveTab] = useState(TableType.MATERIAL)
  const [{ page, paginate }, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const { activeProgram } = useProgram()

  const filterSchema = useMemo<UseFilter>(
    () =>
      dashboardSmileSmdvFilterSchema(
        t,
        tDashboard,
        tOrder,
        language,
        defaultDashboard,
        activeProgram?.id
      ),
    [t, tDashboard, tOrder, language, defaultDashboard, activeProgram?.id]
  )

  const filter = useFilter(filterSchema)

  const params = handleFilter({ page, paginate, ...filter?.query })

  const exportQuery = useQuery({
    queryKey: [`export-dashboard-smile-vs-smdv-report`, params],
    queryFn: () => exportDashboardReport(params),
    enabled: false,
  })

  const {
    data: summary,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
  } = useQuery({
    queryKey: ['dashboard-smile-summary', params],
    queryFn: () => getSmileVsSmdvSummary(params),
    enabled: true,
  })

  const {
    data: entities,
    isLoading: isLoadingEntities,
    isFetching: isFetchingEntities,
  } = useQuery({
    queryKey: ['dashboard-smile-vs-smdv-entity', params],
    queryFn: () => getSmileVsSmdvEntities(params),
    enabled: activeTab === TableType.ENTITY,
  })

  const {
    data: materials,
    isLoading: isLoadingMaterials,
    isFetching: isFetchingMaterials,
  } = useQuery({
    queryKey: ['dashboard-smile-vs-smdv-material', params],
    queryFn: () => getSmileVsSmdvMaterials(params),
    enabled: activeTab === TableType.MATERIAL,
  })

  useEffect(() => {
    if (filter?.query) {
      setDefaultDashboard(filter?.query?.reverse)
    }
  }, [filter?.query])

  return {
    page,
    paginate,
    setPagination,
    data: activeTab === TableType.ENTITY ? entities : materials,
    isLoadingTable:
      isLoadingEntities ||
      isLoadingMaterials ||
      isFetchingEntities ||
      isFetchingMaterials,
    summary,
    isLoadingSummary: isLoadingSummary || isFetchingSummary,
    t,
    tOrder,
    showInformation,
    setShowInformation,
    defaultDashboard,
    setDefaultDashboard,
    activeTab,
    setActiveTab,
    filter,
    exportQuery,
  }
}
