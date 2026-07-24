import axios from '#lib/axios'

import {
  GetEntityParams,
  GetEntityResponse,
  GetOverviewParams,
  GetOverviewResponse,
} from './user-activity.type'

export async function getOverview(params: GetOverviewParams) {
  const response = await axios.get<GetOverviewResponse>(
    '/warehouse-report/activity/all',
    {
      params,
    }
  )
  return response?.data
}

export async function getEntity(params: GetEntityParams) {
  const response = await axios.get<GetEntityResponse>(
    '/warehouse-report/activity/entity',
    {
      params,
    }
  )

  return response?.data
}

export async function getExportEntity(params: GetEntityParams) {
  const response = await axios.get('/warehouse-report/activity/entity/export', {
    params,
  })
  return response?.data
}
