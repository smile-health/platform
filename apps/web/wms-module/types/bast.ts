import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TBast = {
  id: number;
  bastNo: string;
  description: string;
  status: string;
  disposalItems: DisposalItem[];
  createdAt: string;
  createdBy: string;
  createdName: string;
  entityId: number;
  entityName: string;
  isRead: boolean;
  approvedBy: string;
  rejectedBy: string;
  rejectedReason: string;
  approvedAt: string;
  rejectedAt: string;
};

export type DisposalItem = {
  id: number;
  materialId: number;
  bastNo: string;
  materialName: string;
  qty: number;
};

export type GetBastResponse = TCommonResponseList & {
  data: {
    data: TBast[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetBastDetailResponse = {
  data: TBast;
  status: string;
};

export type BastInput = {
  name: string;
  description: string;
};

export enum BastStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export type updateBastApprovalInput = {
  bastNo: string;
  status: BastStatus.APPROVED | BastStatus.REJECTED;
  reason?: string;
};
