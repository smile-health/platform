import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TBudgetSource = {
  id: number;
  name: string;
  description: string;
  updatedAt: string;
  updatedBy: string;
};

export type GetBudgetSourceResponse = TCommonResponseList & {
  data: {
    data: TBudgetSource[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};

export type GetBudgetSourceDetailResponse = {
  data: TBudgetSource;
  status: string;
};

export type BudgetSourceInput = {
  name: string;
  description: string;
};

export type CreateBudgetSourceInput = BudgetSourceInput & {
  createdBy: string;
};

export type UpdateBudgetSourceInput = BudgetSourceInput & {
  updatedBy: string;
};
