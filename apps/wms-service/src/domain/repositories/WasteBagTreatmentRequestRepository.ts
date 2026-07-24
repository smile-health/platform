import WasteBagTreatmentRequest from '../entities/WasteBagTreatmentRequest';

export default interface WasteBagTreatmentRequestRepository {
    createWasteBagTreatmentRequest(
        WasteBagTreatmentRequest: WasteBagTreatmentRequest,
    ): Promise<void>;
    updateWasteBagTreatmentRequest(
        WasteBagTreatmentRequest: WasteBagTreatmentRequest,
    ): Promise<void | null>;
    deleteWasteBagTreatmentRequest(id: string, deletedBy?: number): Promise<boolean | null>;
    getWasteBagTreatmentRequestById(id: string): Promise<WasteBagTreatmentRequest | null>;
    getAllWasteBagTreatmentRequests(
        limit: number,
        page: number,
        entity_id: string | number | undefined,
        search?: string,
    ): Promise<{
        data: WasteBagTreatmentRequest[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
