import ReportTransactionWasteBag from '../entities/TransactionWasteBag';
import { WasteBagLogBook, WasteGroupDetails } from '../entities/WasteBagLogBook';
import {
  WasteBagHistory,
  WasteBagSummaryByCharacteristics,
  WasteSourceSummary,
} from '../entities/WasteBagTrackingHistory';
export default interface ReportWasteBagRepository {
  getWasteBagHistory(
    wasteBagId?: number,
    wasteBagQrCode?: string,
    wasteGroupNumber?: string,
  ): Promise<WasteBagHistory[]>;
  getWasteBagSummaryByCharacteristics(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    includeWasteStatus?: boolean,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteBagSummaryByCharacteristics[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }>;
  getWasteSourceSummary(
    limit: number,
    page: number,
    startDate: string,
    endDate: string,
    healthcareId?: number,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: WasteSourceSummary[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
    summary: {
      totalInternal: number;
      totalInternalTreatment: number;
      totalExternal: number;
    };
  }>;
  getWasteBagLogBook(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
    search?: string,
  ): Promise<{
    data: WasteBagLogBook[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
  getWasteGroupDetails(
    limit: number,
    page: number,
    wasteGroupId: number,
  ): Promise<{
    data: WasteGroupDetails[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
  getWasteBagDetailsInternalTreatment(
    wasteBagQrCodeId: string,
    lang?: string,
  ): Promise<{
    data: any;
  }>;
  getAllTransactionWasteBagRaw(
    limit: number,
    page: number,
    startDate?: string,
    endDate?: string,
    search?: string,
    healthcareId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    transporterId?: number,
    treatmentStatus?: string,
    provinceId?: number,
    cityId?: number,
  ): Promise<{
    data: ReportTransactionWasteBag[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;

  GetWasteBagSummaryByWasteStatus(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
  ): Promise<{
    data: any[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
      totalWeightInKgs: number;
    };
  }>;

  GetWasteBagByWasteStatus(
    limit: number,
    page: number,
    entityId: number,
    startDate: string,
    endDate: string,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteStatus?: string,
    lang?: string,
  ): Promise<{
    data: any[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
}
