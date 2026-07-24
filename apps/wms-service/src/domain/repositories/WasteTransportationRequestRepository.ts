import WasteTransportationRequest from '../entities/WasteTransportationRequest';

export default interface WasteTransportationRequestRepository {
    createWasteTransportationRequest(wasteSource: WasteTransportationRequest): Promise<void>;
    updateWasteTransportationRequest(wasteSource: WasteTransportationRequest): Promise<void | null>;
    deleteWasteTransportationRequest(id: string, deletedBy?: number): Promise<boolean | null>;
    getWasteTransportationRequestById(id: string): Promise<WasteTransportationRequest | null>;
    getAllWasteTransportationRequests(
        limit: number,
        page: number,
        search?: string,
    ): Promise<{
        data: WasteTransportationRequest[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
