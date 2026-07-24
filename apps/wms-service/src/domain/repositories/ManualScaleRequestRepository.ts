import ManualScaleRequest from '../entities/ManualScaleRequest';

export default interface ManualScaleRequestRepository {
  checkDataIsExist(requestedBy: string): Promise<ManualScaleRequest | null>;
  getAllManualRequest(
    limit: number,
    page: number,
    token: string,
    entityId?: number,
    status?: string,
    isActive?: boolean,
    provinceId?: number,
    cityId?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    data: ManualScaleRequest[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }>;
  getOneActiveRequest(requestedBy: string): Promise<ManualScaleRequest | null>;
  waitingApprovalManualScaleRequest(id: number): Promise<ManualScaleRequest | null>;
  activateManualScaleRequest(
    id: number,
    processedBy: string,
    action: 'APPROVED' | 'REJECTED',
  ): Promise<ManualScaleRequest | string | null>;
  createManualScaleRequest(ManualScaleRequest: ManualScaleRequest): Promise<ManualScaleRequest>;
}
