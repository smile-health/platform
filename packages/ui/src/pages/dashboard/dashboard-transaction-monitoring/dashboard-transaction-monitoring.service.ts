import axios from '#lib/axios'

import { GetEntityParams, TCommonChartParams } from '../dashboard.type'
import {
  DashboardTransactionMonitoringBigNumberReponse,
  DashboardTransactionMonitoringChartResponse,
  GetEntityCompleteResponse,
  GetMaterialChart,
  GetTransactionReasonResponse,
} from './dashboard-transaction-monitoring.type'

export async function getTransactionMonitoringChart(
  params: TCommonChartParams
) {
  const response = await axios.get<DashboardTransactionMonitoringChartResponse>(
    '/warehouse-report/monitoring/transaction/chart',
    {
      params,
    }
  )
  return response?.data
}

export async function getMaterialChart(params: TCommonChartParams) {
  const response = await axios.get<GetMaterialChart>(
    '/warehouse-report/monitoring/transaction/material',
    {
      params,
    }
  )
  return response?.data
}

export async function getTransactionReasonChart(params: TCommonChartParams) {
  const response = await axios.get<GetTransactionReasonResponse>(
    '/warehouse-report/monitoring/transaction/reason',
    {
      params,
    }
  )
  return response?.data
}

export async function getEntityComplete(params: GetEntityParams) {
  const response = await axios.get<GetEntityCompleteResponse>(
    '/warehouse-report/monitoring/transaction/entity-complete',
    {
      params,
    }
  )

  return response?.data
}

export async function getTransactionMonitoringBigNumber(
  params: TCommonChartParams
) {
  const response =
    await axios.get<DashboardTransactionMonitoringBigNumberReponse>(
      '/warehouse-report/monitoring/transaction/big-number',
      {
        params,
      }
    )
  return response?.data
}
