import { SERVICE_API } from "#constants/api"
import axios from "#lib/axios"
import {
  ActivityData as GetActivityProgramDetailResponse
} from "#types/activity"
import { handleAxiosResponse } from "#utils/api"
import { parseDownload } from "#utils/download"
import {
  CreateActivityProgramBody,
  ExportActivityProgramParams,
  listActivitiesParams,
  ListActivitiesResponse,
  UpdateStatusActivityProgramResponse
} from "../types/programActivity"

const { CORE } = SERVICE_API

export async function listActivitiesProgram(
  params: listActivitiesParams,
  programId?: number
): Promise<ListActivitiesResponse> {
  const response = await axios.get(`${CORE}/programs/${programId}/activities`, {
    params,
    cleanParams: true,
    headers: {
      'Accept-Language': params.lang,
    },
  })
  return handleAxiosResponse<ListActivitiesResponse>(response)
}

export async function createActivityProgram(data: CreateActivityProgramBody, programId?: number) {
  const response = await axios.post(`${CORE}/programs/${programId}/activities`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updateActivityProgram(
  data: CreateActivityProgramBody,
  id?: string | number,
  programId?: number
) {
  const response = await axios.put(`${CORE}/programs/${programId}/activities/${id}`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function getActivityProgramDetail(id: string | number, programId?: number): Promise<GetActivityProgramDetailResponse> {
  const response = await axios.get(`${CORE}/programs/${programId}/activities/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function importActivityPrograms(data: FormData, programId?: number) {
  const response = await axios.post(`${CORE}/programs/${programId}/activities/xls`, data)

  return response?.data
}

export async function downloadTemplateActivityPrograms(programId: number) {
  const response = await axios.get(`${CORE}/programs/${programId}/activities/xls-template`, {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'master_activities.xlsx')

  return response?.data
}

export async function exportActivityProgram(params: ExportActivityProgramParams, programId?: number) {
  const response = await axios.get(`${CORE}/programs/${programId}/activities/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function updateStatusActivityProgram(
  id: string,
  data: { status: boolean },
  programId?: number
): Promise<UpdateStatusActivityProgramResponse> {
  const response = await axios.put(`${CORE}/programs/${programId}/activities/${id}/status`, data)

  return response?.data
}
