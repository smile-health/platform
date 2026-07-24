import WasteSource from '../entities/WasteSource';

export default interface WasteSourceRepository {
    checkDuplication(wasteSource: WasteSource): Promise<boolean>;
    createWasteSource(wasteSource: WasteSource): Promise<void>;
    updateWasteSource(wasteSource: WasteSource): Promise<void | null>;
    deleteWasteSource(id: string, deletedBy?: number): Promise<boolean | null>;
    getWasteSourceById(id: string): Promise<WasteSource | null>;
    getAllWasteSources(
        limit: number,
        page: number,
        token: string,
        entityId: number,
        search?: string,
        sourceType?: string,
    ): Promise<{
        data: WasteSource[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
