import { WhereOptions } from 'sequelize';
import { AsetManufacturerAttributes } from '../../infrastructure/database/models/AssetManufacturerModel';
import AssetManufacturer from '../entities/AssetManufacturer';

export default interface AssetManufacturerRepository {
    createAssetManufacturer(data: AssetManufacturer): Promise<AsetManufacturerAttributes>;
    getAssetManufacturerById(id: string): Promise<AssetManufacturer | null>;
    getAllAssetManufacturers(
        limit: number,
        page: number,
        search?: string,
        assetType?: string,
        name?: string,
    ): Promise<{
        data: AssetManufacturer[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    deleteAssetManufacturer(id: string, deletedBy?: number): Promise<void | null>;
    updateAssetManufacturer(data: AssetManufacturer): Promise<void | null>;
    findAssetManufacturerByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<AssetManufacturer | null>;
}
