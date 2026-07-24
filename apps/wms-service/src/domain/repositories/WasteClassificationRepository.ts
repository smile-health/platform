import { WhereOptions } from 'sequelize';
import WasteClassification from '../entities/WasteClassification';

export default interface WasteClassificationRepository {
    createWasteClassification(wasteClassification: WasteClassification): Promise<void>;
    updateWasteClassification(wasteClassification: WasteClassification): Promise<void | null>;
    deleteWasteClassification(id: string): Promise<void | number | null>;
    getWasteClassificationById(id: number, token?: string): Promise<WasteClassification | null>;
    findWasteClassificationByCondition(
        whereClause: WhereOptions<any>,
    ): Promise<WasteClassification | null>;
    getAllWasteClassification(
        limit: number,
        page: number,
        token: string,
        search?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        wasteCode?: string,
        useColdStorage?: boolean,
        updatedAt?: string,
        sortBy?: 'wasteCode' | 'useColdStorage' | 'updatedAt' | 'updated_at',
        sortOrder?: 'ASC' | 'DESC',
    ): Promise<{
        data: WasteClassification[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
