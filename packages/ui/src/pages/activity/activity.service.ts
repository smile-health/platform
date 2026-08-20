import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'
import { removeEmptyObject } from '#utils/object'

import {
  CreateActivityBody,
  DetailActivityResponse,
  ExportActivitiesParams,
  ListActivitiesParams,
  ListActivitiesResponse,
  UpdateStatusActivityResponse,
} from './activity.type'

const MAIN_SERVICE = SERVICE_API.MAIN
export async function listActivities(
  rawParams: ListActivitiesParams
): Promise<ListActivitiesResponse> {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${MAIN_SERVICE}/activities`, {
    params,
    cleanParams: true,
  })
  return handleAxiosResponse<ListActivitiesResponse>(response)
}

export async function deleteActivity(id?: string | number) {
  const response = await axios.delete(`${MAIN_SERVICE}/activities/${id}`)
  return response?.data
}

export async function exportActivity(rawParams: ExportActivitiesParams) {
  const params = removeEmptyObject(rawParams)
  const response = await axios.get(`${MAIN_SERVICE}/activities/xls`, {
    responseType: 'blob',
    params: {
      keyword: params?.keyword,
    },
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateActivity() {
  const response = await axios.get(`${MAIN_SERVICE}/activities/xls-template`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'master_activities.xlsx')

  return response?.data
}

export async function importActivity(data: FormData) {
  const response = await axios.post(`${MAIN_SERVICE}/activities/xls`, data)

  return response?.data
}

export async function createActivity(data: CreateActivityBody) {
  const response = await axios.post(`${MAIN_SERVICE}/activities`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateActivity(
  data: CreateActivityBody,
  id?: string | number
) {
  const response = await axios.put(`${MAIN_SERVICE}/activities/${id}`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getActivity(
  id: string | number
): Promise<DetailActivityResponse> {
  const response = await axios.get(`${MAIN_SERVICE}/activities/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function updateStatusActivity(
  id: string,
  data: { status: boolean }
): Promise<UpdateStatusActivityResponse> {
  const response = await axios.put(`${MAIN_SERVICE}/activities/${id}/status`, data)

  return response?.data
}
