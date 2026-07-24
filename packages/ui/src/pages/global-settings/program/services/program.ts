import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { TCommonResponseList } from '#types/common'
import { TProgram as DetailProgramResponse, TProgram } from '#types/program'
import { TProtocol } from '#types/protocol'
import { parseDownload } from '#utils/download'

import {
  ProgramForm as CreateProgramBody,
  ListProgramsParams,
  UpdateProgramsStatusBody,
} from '../types/program'

const { CORE } = SERVICE_API

export type ListProgramsResponse = TCommonResponseList & {
  data: Array<TProgram>
}

export type ListProtocolsResponse = TCommonResponseList & {
  data: Array<TProtocol>
}

export async function listProtocols(): Promise<ListProtocolsResponse> {
  const response = await axios.get(`${CORE}/protocols`)

  return response?.data
}

export async function listPrograms(
  params: ListProgramsParams
): Promise<ListProgramsResponse> {
  const response = await axios.get(`${CORE}/programs`, {
    params,
  })

  return response?.data
}

export async function exportPrograms(params?: ListProgramsParams) {
  const response = await axios.get(`${CORE}/programs/xls`, {
    responseType: 'blob',
    params,
    cleanParams: true,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function createPrograms(
  data: CreateProgramBody
): Promise<DetailProgramResponse> {
  const response = await axios.post(`${CORE}/programs`, data, {
    cleanBody: true,
  })

  return response?.data
}

export async function updatePrograms(
  id: string,
  data: CreateProgramBody
): Promise<DetailProgramResponse> {
  const response = await axios.put(`${CORE}/programs/${id}`, data)

  return response?.data
}

export async function detailPrograms(
  id: string
): Promise<DetailProgramResponse> {
  const response = await axios.get(`${CORE}/programs/${id}`, {
    redirect: true,
  })

  return response?.data
}

export async function updateProgramsStatus(
  id: string,
  data: UpdateProgramsStatusBody
): Promise<DetailProgramResponse> {
  const response = await axios.post(`${CORE}/program/status/${id}`, data)

  return response?.data
}
