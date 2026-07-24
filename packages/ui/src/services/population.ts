import axios from '#lib/axios'
import {
  DetailPopulationParams,
  DetailPopulationResponse,
  ListYearPopulationParams,
  ListYearPopulationResponse,
} from '#types/population'
import { handleAxiosResponse } from '#utils/api'
import { parseDownload } from '#utils/download'

export async function getListYearPopulation(
  params: ListYearPopulationParams
): Promise<ListYearPopulationResponse> {
  const response = await axios.get('/core/annual-planning/populations', {
    params,
    cleanParams: true,
  })

  return handleAxiosResponse<ListYearPopulationResponse>(response)
}

export async function activatePopulation(year: number) {
  const response = await axios.put(`/core/annual-planning/populations/${year}`)

  return response?.data
}

export async function importPopulation(year: number, data: FormData) {
  const response = await axios.post(
    `/core/annual-planning/populations/import/${year}`,
    data
  )

  return response?.data
}

export async function getTemplatePopulation() {
  const response = await axios.get(
    '/core/annual-planning/populations/template',
    {
      responseType: 'blob',
      cleanParams: true,
    }
  )
  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'Population-template.xlsx'
  )

  return response?.data
}

export async function getDetailPopulation(
  programPlanId: number,
  filter: DetailPopulationParams
): Promise<DetailPopulationResponse> {
  const response = await axios.get(
    `/main/annual-planning/program-plans/${programPlanId}/population`,
    {
      params: filter,
    }
  )

  return handleAxiosResponse<DetailPopulationResponse>(response)
}

export async function getDetailPopulationGlobal(
  year: number,
  filter: DetailPopulationParams
): Promise<DetailPopulationResponse> {
  const response = await axios.get(
    `/core/annual-planning/populations/${year}`,
    {
      params: filter,
    }
  )

  return handleAxiosResponse<DetailPopulationResponse>(response)
}

export async function exportPopulation(
  id: number,
  filter: DetailPopulationParams
) {
  const response = await axios.get(
    `/core/annual-planning/populations/export/${id}`,
    {
      params: filter,
      responseType: 'blob',
    }
  )

  parseDownload(
    response?.data,
    response?.headers?.filename ?? 'Population.xlsx'
  )

  return response?.data
}
