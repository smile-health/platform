import axios from '@/lib/axios';
import { parseDownload } from '@repo/ui/utils/download';

import {
  GetChartParams,
  GetChartResponse,
  GetChartWasteGroupSummaryResponse,
  GetEntityResponse,
} from '@/types/transaction-monitoring';

export async function getChartWasteGroupSummary(params: GetChartParams) {
  const response = await axios.get<GetChartWasteGroupSummaryResponse>(
    '/dashboard-monitoring/waste-group-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}

export async function getChartWasteCharacteristicsSummary(
  params: GetChartParams
) {
  const response = await axios.get<GetChartResponse>(
    '/dashboard-monitoring/waste-characteristics-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}

export async function getChartMonthlyWasteBagSummary(params: GetChartParams) {
  const response = await axios.get<GetChartResponse>(
    '/dashboard-monitoring/monthly-waste-bag-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}

export async function getChartProvinceWasteBagSummary(params: GetChartParams) {
  const response = await axios.get<GetChartResponse>(
    '/dashboard-monitoring/province-waste-bag-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}
export async function getChartRegencyWasteBagSummary(params: GetChartParams) {
  const response = await axios.get<GetChartResponse>(
    '/dashboard-monitoring/regency-waste-bag-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}

export async function getChartEntity(params: GetChartParams) {
  const response = await axios.get<GetEntityResponse>(
    '/dashboard-monitoring/entity-waste-bag-summary-chart',
    {
      params,
    }
  );
  return response?.data;
}
export async function getChartEntityWasteGroup(params: GetChartParams) {
  const response = await axios.get<GetEntityResponse>(
    '/dashboard-monitoring/entity-waste-bag-summary-by-group',
    {
      params,
    }
  );
  return response?.data;
}

export async function getChartEntityComplete(params: GetChartParams) {
  const response = await axios.get<GetEntityResponse>(
    '/dashboard-monitoring/entity-waste-bag-summary-by-characteristics',
    {
      params,
    }
  );
  return response?.data;
}

export async function getExportChart(params: GetChartParams) {
  const response = await axios.get('/dashboard-monitoring/export', {
    responseType: 'blob',
    params,
  });

  parseDownload(response?.data, response?.headers?.filename);

  return response?.data;
}
