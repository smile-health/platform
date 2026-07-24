export type CommonType = {
  isGlobal?: boolean;
};

export type ErrorResponse = {
  message: string;
  errors: {
    [key: string]: string[] | any;
  };
  status: string;
  data: {
    [key: string]: string[] | any;
  };
};

export type TCommonFilter = {
  page: number;
  limit: number;
};

export type TCommonResponseList = {
  page: number;
  item_per_page: number;
  total_item: number;
  total_page: number;
  list_pagination?: number[];
};

export type SuccessResponse = {
  message: string;
  success: boolean;
};

export type TInfoUserCreated = {
  firstname: string;
  id: number;
  lastname?: string;
  username: string;
};

export type TSingleOptions = {
  label: string;
  value: number | string;
};

export type TMultipleOptions = {
  label: string;
  value: number[] | string[];
};

export type TCommonObject = {
  id: number;
  name: string;
};

export type TCurrency = 'IDR';

export type TCommonPaginationResponse = {
  total: number;
  pages: number;
  currentPage: number;
  perPage: number;
};
