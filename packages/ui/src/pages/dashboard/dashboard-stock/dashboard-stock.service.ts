import axios from '#lib/axios'

import { GetEntityParams } from '../dashboard.type'
import {
  GetMaterialEntityResponse,
  GetStockEntityResponse,
} from './dashboard-stock.type'

export async function getMaterialEntity(params: GetEntityParams) {
  const response = await axios.get<GetMaterialEntityResponse>(
    '/warehouse-report/monitoring/stock/material-entity',
    {
      params,
    }
  )
  return response?.data
}

export async function getStockEntity(params: GetEntityParams) {
  const response = await axios.get<GetStockEntityResponse>(
    '/warehouse-report/monitoring/stock/entity-stock',
    {
      params,
    }
  )

  return response?.data
}
