import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  AnnualTargetAchievement,
  FacilityPercentage,
  FacilityTotal,
} from './use-cases/annual-capacity-of-cold-storage/types'
import {
  AggregateCapacityRemaining,
  CapacityRemaining,
  FunctionStatus,
} from './use-cases/detail/types'
import {
  AverageMonthlyConsumption,
  AverageOrderLeadTime,
  CapacityStatus,
  DayOfSupply,
  EntityByColdstorageStatusCapacity,
} from './use-cases/overview/types'

const BASE_URL = '/warehouse-report/cce'

export type GetDashboardCceOverviewRequest = {
  entity_ids: string
  entity_tag_ids: string
  month: string
  year: string
  province_ids: string
  regency_ids: string
  program_ids: string | number
}

type GetDashboardCceOverviewResponse = {
  average_monthly_consumption?: AverageMonthlyConsumption
  average_order_lead_time?: AverageOrderLeadTime
  capacity_status?: CapacityStatus
  day_of_supply?: DayOfSupply
  entity_by_coldstorage_status_capacity?: EntityByColdstorageStatusCapacity
}

export async function getDashboardCceOverview(
  params: GetDashboardCceOverviewRequest
): Promise<GetDashboardCceOverviewResponse> {
  const response = await axios.get(
    `${BASE_URL}/overview/aggregate-capacity-report`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export type GetDashboardCceMaterialRequest = {
  entity_ids: string
  entity_tag_ids: string
  is_pqs: string
  month: string
  province_ids: string
  regency_ids: string
  year: string
  program_ids: string | number
}

type GetDashboardCceMaterialResponse = {
  aggregate_capacity_remaining: AggregateCapacityRemaining
  capacity_remaining: CapacityRemaining
  function_status: FunctionStatus
}

export async function getDashboardCceMaterial(
  params: GetDashboardCceMaterialRequest
): Promise<GetDashboardCceMaterialResponse> {
  const response = await axios.get(`${BASE_URL}/material`, {
    params,
    cleanParams: true,
  })
  return response?.data
}

export type GetDashboardCceAnnualRequest = {
  entity_ids: string
  entity_tag_ids: string
  is_who_pqs: string
  province_ids: string
  regency_ids: string
  year: string
  program_ids: string | number
}

type GetDashboardCceAnnualResponse = {
  annual_target_achievement: AnnualTargetAchievement
  facility_percentage: FacilityPercentage
  facility_total: FacilityTotal
}

export async function getDashboardCceAnnual(
  params: GetDashboardCceAnnualRequest
): Promise<GetDashboardCceAnnualResponse> {
  const response = await axios.get(`${BASE_URL}/annual`, {
    params,
    cleanParams: true,
  })
  return response?.data
}

export async function exportCceEntityByCapacityStatus(
  params: GetDashboardCceOverviewRequest
) {
  const response = await axios.get(
    `${BASE_URL}/export/entity-by-capacity-status`,
    { responseType: 'blob', params, cleanParams: true }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}

export async function exportCceFunctionStatus(
  params: GetDashboardCceMaterialRequest
) {
  const response = await axios.get(
    `${BASE_URL}/export/material/function-status`,
    { responseType: 'blob', params, cleanParams: true }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}

export async function exportCceCapacityRemaining(
  params: GetDashboardCceMaterialRequest
) {
  const response = await axios.get(
    `${BASE_URL}/export/material/capacity-remaining`,
    { responseType: 'blob', params, cleanParams: true }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}

export async function exportCceAggregateCapacityRemaining(
  params: GetDashboardCceMaterialRequest
) {
  const response = await axios.get(
    `${BASE_URL}/export/material/aggregate-capacity-remaining`,
    { responseType: 'blob', params, cleanParams: true }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}

export async function exportCceAnnualFacilityTotal(
  params: GetDashboardCceAnnualRequest
) {
  const response = await axios.get(`${BASE_URL}/export/annual/facility-total`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}

export async function exportCceAnnualFacilityPercentage(
  params: GetDashboardCceAnnualRequest
) {
  const response = await axios.get(
    `${BASE_URL}/export/annual/facility-percentage`,
    { responseType: 'blob', params, cleanParams: true }
  )
  parseDownload(response?.data, response?.headers?.filename)
  return response?.data
}
