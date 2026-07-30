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

const USER_ROLE_PAGE_LIMIT = 50;

export async function loadUserRole(
  _keyword: string,
  _loadedOptions: unknown,
  additional: { page: number } = { page: 1 }
) {
  const result = await getUserRole({
    page: additional.page,
    limit: USER_ROLE_PAGE_LIMIT,
  });

  if (result?.data.data.length === 0)
    return {
      options: [],
      hasMore: false,
      additional,
    };

  const options = result?.data.data.map((item) => ({
    label: item?.name,
    value: item?.type,
  }));

  return {
    options,
    hasMore: result?.data.data.length >= USER_ROLE_PAGE_LIMIT,
    additional: {
      page: additional.page + 1,
    },
  };
}
