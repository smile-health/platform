import axios from '#lib/axios'

import {
  ActivityOverviewResponse,
  ChartOverviewResponse,
  DashboardInventoryMaterialsEntitiesParams,
  DashboardInventoryMaterialsParams,
  DashboardInventoryOverviewParams,
  InventoryMaterialEntitiesResponse,
  InventoryMaterialResponse,
  LocationResponse,
} from './dashboard-inventory-overview.type'

export async function getInventoryOverview(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<ChartOverviewResponse>(
    '/warehouse-report/inventory/stocks/overview',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getInventoryLocation(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<LocationResponse>(
    '/warehouse-report/inventory/stocks/location',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getInventoryMaterial(
  params: DashboardInventoryMaterialsParams
) {
  const response = await axios.get<InventoryMaterialResponse>(
    '/warehouse-report/inventory/stocks/materials',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getInventoryMaterialEntities(
  params: DashboardInventoryMaterialsEntitiesParams
) {
  const response = await axios.get<InventoryMaterialEntitiesResponse>(
    '/warehouse-report/inventory/stocks/materials/entities',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getTemperatureOverview(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<ChartOverviewResponse>(
    '/warehouse-report/inventory/temperatures/overview',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getTemperatureLocation(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<LocationResponse>(
    '/warehouse-report/inventory/temperatures/location',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getActivityOverview(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<ActivityOverviewResponse>(
    '/warehouse-report/inventory/activities/overview',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}

export async function getActivityLocation(
  params: DashboardInventoryOverviewParams
) {
  const response = await axios.get<LocationResponse>(
    '/warehouse-report/inventory/activities/location',
    {
      params,
      cleanParams: true,
    }
  )

  return response?.data
}
