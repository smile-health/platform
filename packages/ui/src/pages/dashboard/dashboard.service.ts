import axios from '#lib/axios'
import { parseDownload } from '#utils/download'

import {
  DashboardIOTBaseParams,
  DashboardIOTOverviewReponse,
  DashboardIOTPaginateResponse,
  DashboardIOTPaginationParams,
  GetChartResponse,
  GetEntityParams,
  GetEntityResponse,
  GetProvinceChartResponse,
  GetRegencyChartResponse,
  TCommonChartParams,
  TDashboardIOTSubPath,
} from './dashboard.type'

export async function getChart(
  params: TCommonChartParams,
  type: 'stock' | 'transaction'
) {
  const response = await axios.get<GetChartResponse>(
    `/warehouse-report/monitoring/${type}/chart`,
    {
      params,
    }
  )
  return response?.data
}

export async function getProvinceChart(
  params: TCommonChartParams,
  type: 'stock' | 'transaction'
) {
  const response = await axios.get<GetProvinceChartResponse>(
    `/warehouse-report/monitoring/${type}/province`,
    {
      params,
    }
  )
  return response?.data
}

export async function getRegencyChart(
  params: TCommonChartParams,
  type: 'stock' | 'transaction'
) {
  const response = await axios.get<GetRegencyChartResponse>(
    `/warehouse-report/monitoring/${type}/regency`,
    {
      params,
    }
  )
  return response?.data
}

export async function getEntity(
  params: GetEntityParams,
  type: 'stock' | 'transaction'
) {
  const response = await axios.get<GetEntityResponse>(
    `/warehouse-report/monitoring/${type}/entity`,
    {
      params,
    }
  )
  return response?.data
}

export async function exportChart(
  params: TCommonChartParams,
  type: 'stock' | 'transaction'
) {
  const response = await axios.get(
    `/warehouse-report/monitoring/${type}/export`,
    {
      responseType: 'blob',
      params,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function getDashboardIOTReview(
  params: DashboardIOTBaseParams,
  subpath: TDashboardIOTSubPath
) {
  const response = await axios.get<DashboardIOTOverviewReponse>(
    `/warehouse-report/${subpath}/review`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getDashboardIOTMaterial(
  params: DashboardIOTPaginationParams,
  subpath: TDashboardIOTSubPath
) {
  const response = await axios.get<DashboardIOTPaginateResponse>(
    `/warehouse-report/${subpath}/material`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getDashboardIOTEntity(
  params: DashboardIOTPaginationParams,
  subpath: TDashboardIOTSubPath
) {
  const response = await axios.get<DashboardIOTPaginateResponse>(
    `/warehouse-report/${subpath}/entity`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getDashboardIOTLocation(
  params: DashboardIOTPaginationParams,
  subpath: TDashboardIOTSubPath
) {
  const response = await axios.get<DashboardIOTPaginateResponse>(
    `/warehouse-report/${subpath}/location`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function getDashboardIOTMaterialEntity(
  params: DashboardIOTPaginationParams,
  subpath: TDashboardIOTSubPath
) {
  const response = await axios.get<DashboardIOTPaginateResponse>(
    `/warehouse-report/${subpath}/entity-material`,
    {
      params,
      cleanParams: true,
    }
  )
  return response?.data
}

export async function exportDashboardIOT(
  params: DashboardIOTBaseParams,
  subpath: TDashboardIOTSubPath,
  type: string
) {
  const response = await axios.get(
    `/warehouse-report/${subpath}/${type}/export`,
    {
      responseType: 'blob',
      params,
    }
  )

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}
