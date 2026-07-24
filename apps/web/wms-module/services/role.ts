import { TCommonFilter } from '@/types/common';
import { GetRoleResponse } from '@/types/role';
import { handleAxiosResponse } from '@/utils/api';
import axios from 'src/lib/axios';

export async function getUserRole(
  params: TCommonFilter
): Promise<GetRoleResponse> {
  const response = await axios.get('/roles', {
    params,
  });

  return handleAxiosResponse<GetRoleResponse>(response);
}

export async function loadUserRole() {
  const result = await getUserRole({
    page: 1,
    limit: 50,
  });

  if (result?.data.data.length === 0)
    return {
      options: [],
      hasMore: false,
    };

  const options = result?.data.data.map((item) => ({
    label: item?.name,
    value: item?.type,
  }));

  return {
    options,
    hasMore: result?.data.data.length > 0,
  };
}
