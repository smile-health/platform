import AssetModel from '../entities/AssetModel';

export default interface AssetModelRepository {
    createAssetModel(AssetModel: AssetModel): Promise<void>;
    getAssetModelById(id: number): Promise<AssetModel | null>;
    getAllAssetModels(
        limit: number,
        page: number,
        search?: string,
        assetType?: string,
        manufacturerId?: number,
    ): Promise<{
        data: AssetModel[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    deleteAssetModel(id: number, deletedBy?: number): Promise<void | null>;
    updateAssetModel(assetModel: AssetModel): Promise<AssetModel | null>;
}
