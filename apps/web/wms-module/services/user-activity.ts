import axios from '@/lib/axios';

import {
  GetEntityParams,
  GetEntityResponse,
  GetOverviewEntityResponse,
} from '../types/user-activity';

export async function getOverview(params: GetEntityParams) {
  const response = await axios.get<GetOverviewEntityResponse>(
    '/dashboard/summary-users-activity',
    {
      params,
    }
  );
  return response?.data;
}

export async function getUserActivity(params: GetEntityParams) {
  const response = await axios.get<GetEntityResponse>(
    '/dashboard/summary-activity-entities',
    {
      params,
    }
  );

  return response?.data;
}

export async function getManualScaleUserActivity(params: GetEntityParams) {
  const response = await axios.get<GetEntityResponse>(
    '/dashboard/manual-scale-activity-entities',
    {
      params,
    }
  );

  return response?.data;
}
