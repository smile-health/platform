import AssetDongle from '../entities/AssetDongle';

export default interface AssetDongleRepository {
    createAssetDongle(AssetDongle: AssetDongle): Promise<void>;
    getAllAssetDongle(
        limit: number,
        page: number,
        search?: string,
    ): Promise<{
        data: AssetDongle[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    deleteAssetDongle(assetId: string, deletedBy?: number): Promise<void | null>;
}
