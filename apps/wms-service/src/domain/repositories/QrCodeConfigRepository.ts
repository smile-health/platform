import QrCodeConfig from '../entities/QrCodeConfig';

export default interface QrCodeConfigRepository {
    createQrCodeConfig(QrCodeConfig: QrCodeConfig): Promise<void>;
    updateQrCodeConfig(QrCodeConfig: QrCodeConfig): Promise<void | null>;
    deleteQrCodeConfig(id: string, deletedBy?: number): Promise<boolean | null>;
    getQrCodeConfigById(id: string): Promise<QrCodeConfig | null>;
    getOneByWasteSourceId(id: number): Promise<number | undefined>;
    getAllQrCodeConfigs(
        limit: number,
        page: number,
        token: string,
        lang: string,
        entity_id: string | number | undefined,
        search?: string,
        sourceType?: string,
        validSortBy?: string,
        validSortOrder?: string,
    ): Promise<{
        data: QrCodeConfig[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
