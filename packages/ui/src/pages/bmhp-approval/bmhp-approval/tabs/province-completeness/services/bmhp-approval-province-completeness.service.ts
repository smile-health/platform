import axios from '#lib/axios'
import { handleAxiosResponse } from '#utils/api'

import {
  CompletenessMonitoringParams,
  CompletenessMonitoringResponse,
  ProvinceStatusType,
  ProvinceTableParams,
  ProvinceTableResponse,
  TProvinceMonitoringItem,
} from '../libs/bmhp-approval-province-completeness.type'

const baseUrl = 'main/'

// ── Dummy Data for Completeness Monitoring Table (for development/testing) ───────

const dummyCompletenessMonitoringData: CompletenessMonitoringResponse = {
  page: 1,
  item_per_page: 10,
  total_item: 8,
  total_page: 1,
  list_pagination: [10, 20, 50],
  data: [
    {
      puskesmas_id: 1,
      puskesmas_name: 'Puskesmas Tegal Sari',
      sub_district_name: 'Tegal Sari',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'complete',
        },
      ],
      progress: { completed: 3, total: 3 },
    },
    {
      puskesmas_id: 2,
      puskesmas_name: 'Puskesmas Gubeng',
      sub_district_name: 'Gubeng',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'incomplete',
        },
      ],
      progress: { completed: 2, total: 3 },
    },
    {
      puskesmas_id: 3,
      puskesmas_name: 'Puskesmas Wonokromo',
      sub_district_name: 'Wonokromo',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'complete',
        },
      ],
      progress: { completed: 3, total: 3 },
    },
    {
      puskesmas_id: 4,
      puskesmas_name: 'Puskesmas Simokerto',
      sub_district_name: 'Simokerto',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'incomplete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'incomplete',
        },
      ],
      progress: { completed: 1, total: 3 },
    },
    {
      puskesmas_id: 5,
      puskesmas_name: 'Puskesmas Genteng',
      sub_district_name: 'Genteng',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'complete',
        },
      ],
      progress: { completed: 3, total: 3 },
    },
    {
      puskesmas_id: 6,
      puskesmas_name: 'Puskesmas Bubutan',
      sub_district_name: 'Bubutan',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'incomplete',
        },
      ],
      progress: { completed: 2, total: 3 },
    },
    {
      puskesmas_id: 7,
      puskesmas_name: 'Puskesmas Tambaksari',
      sub_district_name: 'Tambaksari',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'complete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'complete',
        },
      ],
      progress: { completed: 3, total: 3 },
    },
    {
      puskesmas_id: 8,
      puskesmas_name: 'Puskesmas Kenjeran',
      sub_district_name: 'Kenjeran',
      screenings: [
        { examination_id: 1, examination_name: 'Hb', status: 'complete' },
        {
          examination_id: 2,
          examination_name: 'Gula Darah',
          status: 'incomplete',
        },
        {
          examination_id: 3,
          examination_name: 'Kolesterol',
          status: 'incomplete',
        },
      ],
      progress: { completed: 1, total: 3 },
    },
  ],
}

// ── Mapper: Convert API response to Table structure ─────────────────────────────

const mapStatusToProvinceStatus = (status: string): ProvinceStatusType => {
  switch (status) {
    case 'APPROVED':
      return 'complete'
    case 'DRAFT':
    case 'REJECTED':
    case 'SUBMITTED':
      return 'incomplete'
    default:
      return 'not_submitted'
  }
}

const mapMonitoringItemToProvinceItem = (item: TProvinceMonitoringItem) => {
  return {
    id: item.entity_id,
    city_id: item.entity_id,
    city_name: item.entity_name,
    status: mapStatusToProvinceStatus(item.status),
    total_health_care: item.total_puskesmas,
    completed_health_care: Math.floor(
      (item.completion_percentage / 100) * item.total_puskesmas
    ),
    updated_at: item.submitted_at,
    user_updated_by: undefined,
  }
}

/**
 * GET /bmhp-approval/province/monitor
 */
export const getProvinceTable = async (
  params: ProvinceTableParams
): Promise<ProvinceTableResponse> => {
  const response = await axios.get(`${baseUrl}bmhp-approval/province/monitor`, {
    params,
    cleanParams: true,
  })
  const apiResponse = handleAxiosResponse<{
    page: number
    item_per_page: number
    total_item: number
    total_page: number
    list_pagination: number[]
    data: TProvinceMonitoringItem[]
  }>(response)

  // Map API response to table structure
  return {
    ...apiResponse,
    data: apiResponse.data.map(mapMonitoringItemToProvinceItem),
  }
}

/**
 * GET /bmhp-approval-province/completeness-monitoring
 */
export const getCompletenessMonitoring = async (
  params: CompletenessMonitoringParams
): Promise<CompletenessMonitoringResponse> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return dummyCompletenessMonitoringData
}

/**
 * GET /bmhp-approval-province/detail/:year_id
 */
export const getBmhpApprovalProvinceDetail = async (
  year_id: number
): Promise<{ id: number; year: number }> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { id: year_id, year: year_id }
}
