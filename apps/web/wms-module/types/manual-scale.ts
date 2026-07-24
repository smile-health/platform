import { TCommonPaginationResponse, TCommonResponseList } from './common';

export enum ManualScaleStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  EXPIRED = 'EXPIRED',
}

export type updateManualScaleApprovalInput = {
  id: number;
  status: ManualScaleStatus.APPROVED | ManualScaleStatus.REJECTED;
};

export type TManualScale = {
  id: number;
  requestedBy: string;
  processedBy: string;
  isActive: boolean;
  status: string;
  approvalType: string;
  validUntil: string;
  countLimit: number;
  entityId: number;
  createdAt: string;
  updatedAt: string;
  operatorName: string;
  entityName: string;
  processedName: string;
};

export type GetManualRequestResponse = TCommonResponseList & {
  data: {
    data: TManualScale[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
