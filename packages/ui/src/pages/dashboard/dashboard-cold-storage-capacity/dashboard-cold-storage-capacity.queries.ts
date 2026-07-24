import { useQuery } from '@tanstack/react-query'
import { WORKSPACE } from '#constants/program'
import dayjs from 'dayjs'

import {
  exportCceAggregateCapacityRemaining,
  exportCceAnnualFacilityPercentage,
  exportCceAnnualFacilityTotal,
  exportCceCapacityRemaining,
  exportCceEntityByCapacityStatus,
  exportCceFunctionStatus,
  getDashboardCceAnnual,
  getDashboardCceMaterial,
  getDashboardCceOverview,
} from './dashboard-cold-storage-capacity.services'
import { DashboardColdStorageCapacityFilterParams } from './use-cases/filter/useDashboardColdStorageCapacityFilterSchema.types'

export const GET_DASHBOARD_CCE_OVERVIEW_QUERY_KEY = 'get-dashboard-cce-overview'

export const useGetDashboardCceOverviewQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams
) => {
  const { data, isLoading } = useQuery({
    queryKey: [GET_DASHBOARD_CCE_OVERVIEW_QUERY_KEY, filterValues],
    queryFn: () => {
      return getDashboardCceOverview({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      })
    },
  })

  return {
    data,
    isLoading,
  }
}

export const GET_DASHBOARD_CCE_MATERIAL_QUERY_KEY = 'get-dashboard-cce-material'

export const useGetDashboardCceMaterialQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams,
  isPqs: boolean
) => {
  const { data, isLoading } = useQuery({
    queryKey: [GET_DASHBOARD_CCE_MATERIAL_QUERY_KEY, filterValues, isPqs],
    queryFn: () => {
      return getDashboardCceMaterial({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_pqs: isPqs ? '1' : '0',
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      })
    },
  })

  return {
    data,
    isLoading,
  }
}

export const GET_DASHBOARD_CCE_ANNUAL_QUERY_KEY = 'get-dashboard-cce-annual'

export const useGetDashboardCceAnnualQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams
) => {
  const { data, isLoading } = useQuery({
    queryKey: [GET_DASHBOARD_CCE_ANNUAL_QUERY_KEY, filterValues],
    queryFn: () => {
      return getDashboardCceAnnual({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_who_pqs: '',
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        year: dayjs(filterValues.period?.start).format('YYYY'),
        program_ids: WORKSPACE.immunization.id,
      })
    },
  })

  return {
    data,
    isLoading,
  }
}

// Export queries

export const useExportCceEntityByCapacityStatusQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-entity-by-capacity-status', filterValues],
    queryFn: () =>
      exportCceEntityByCapacityStatus({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}

export const useExportCceFunctionStatusQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams,
  isPqs: boolean
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-function-status', filterValues, isPqs],
    queryFn: () =>
      exportCceFunctionStatus({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_pqs: isPqs ? '1' : '0',
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}

export const useExportCceCapacityRemainingQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams,
  isPqs: boolean
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-capacity-remaining', filterValues, isPqs],
    queryFn: () =>
      exportCceCapacityRemaining({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_pqs: isPqs ? '1' : '0',
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}

export const useExportCceAggregateCapacityRemainingQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams,
  isPqs: boolean
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-aggregate-capacity-remaining', filterValues, isPqs],
    queryFn: () =>
      exportCceAggregateCapacityRemaining({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_pqs: isPqs ? '1' : '0',
        month: dayjs(filterValues.period?.start).format('MM'),
        year: dayjs(filterValues.period?.start).format('YYYY'),
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}

export const useExportCceAnnualFacilityTotalQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-annual-facility-total', filterValues],
    queryFn: () =>
      exportCceAnnualFacilityTotal({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_who_pqs: '',
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        year: dayjs(filterValues.period?.start).format('YYYY'),
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}

export const useExportCceAnnualFacilityPercentageQuery = (
  filterValues: DashboardColdStorageCapacityFilterParams
) => {
  const { refetch, isFetching } = useQuery({
    queryKey: ['export-cce-annual-facility-percentage', filterValues],
    queryFn: () =>
      exportCceAnnualFacilityPercentage({
        entity_ids: filterValues.entity?.value,
        entity_tag_ids: filterValues.entity_tag
          ?.map((item) => item.value)
          .join(','),
        is_who_pqs: '',
        province_ids: filterValues.province?.value,
        regency_ids: filterValues.regency?.value,
        year: dayjs(filterValues.period?.start).format('YYYY'),
        program_ids: WORKSPACE.immunization.id,
      }),
    enabled: false,
  })
  return { refetch, isFetching }
}
