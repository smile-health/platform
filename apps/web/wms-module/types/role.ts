import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TUserRole = {
  id: number;
  createdBy: string;
  updatedBy: string;
  name: string;
  type: string;
  description: string | null;
  regionId: number;
};

export type GetRoleResponse = TCommonResponseList & {
  data: {
    data: TUserRole[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
