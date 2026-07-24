import HealthcareFacilityAsset from '../entities/HealthcareFacilityAsset';
import { UserInfo } from '../../shared/types/userInfo';
import { WhereOptions } from 'sequelize';

export default interface HealthcareFacilityAssetRepository {
    createHealthcareFacilityAsset(data: HealthcareFacilityAsset): Promise<void>;
    getHealthcareFacilityAssetById(id: number): Promise<HealthcareFacilityAsset | null>;
    getAllHealthcareFacilityAsset(
        limit: number,
        page: number,
        token: string,
        search?: string,
        healthcareFacilityId?: number,
        assetType?: string,
        manufacturerId?: number,
        isIotEnable?: number,
        assetStatus?: string,
    ): Promise<{
        data: HealthcareFacilityAsset[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    deleteHealthcareFacilityAsset(id: string, deletedBy?: number): Promise<void | null>;
    updateHealthcareFacilityAsset(data: HealthcareFacilityAsset): Promise<void | null>;
    findHealthcareFacilityAssetByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<HealthcareFacilityAsset | null>;
    getAllHealthcareFacilityAssetByEntityId(
        limit: number,
        page: number,
        userId: UserInfo | null,
        search?: string,
        assetType?: string,
        manufacturerId?: number,
    ): Promise<{
        data: HealthcareFacilityAsset[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
