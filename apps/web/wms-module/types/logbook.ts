import { TCommonPaginationResponse, TCommonResponseList } from './common';

export type TLogbook = {
  wasteGroupId: number;
  wasteGroupNumber: string;
  totalWeightInKgs: number;
  thirdPartyName: string;
  operatorName: string;
  vehicleNumber: string;
  healthcareFacilityName: string;
  transportDate: string;
  processingDate: string;
  pickupTime: string;
  dropTime: string;
  processTime: string;
  landfillTime: string;
  recycleTime: string;
};

export type GetLogbookResponse = TCommonResponseList & {
  data: {
    data: TLogbook[];
    pagination: TCommonPaginationResponse;
  };
  status: string;
};
