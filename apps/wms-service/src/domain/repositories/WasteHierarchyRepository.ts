import { WhereOptions } from 'sequelize';
import WasteHierarchy from '../entities/WasteHierarchy';
import DashboardWasteHierarchy from '../entities/Dashboard';

export default interface WasteHierarchyRepository {
    createWasteHierarchy(wasteHierarchy: WasteHierarchy): Promise<void>;
    updateWasteHierarchy(wasteHierarchy: WasteHierarchy): Promise<void | null>;
    getWasteHierarchyById(id: string): Promise<WasteHierarchy | null>;
    deleteWasteHierarchy(id: string): Promise<boolean | string>;
    getWasteHierarchyByParentHierarchyId(parentHierarchyId: string): Promise<WasteHierarchy[]>;
    getWasteHierarchyByParentHierarchyIdNull(): Promise<WasteHierarchy[]>;
    findWasteHierarchyByCondition(whereClause: WhereOptions<any>): Promise<WasteHierarchy | null>;
    getAllWasteHierarchy(
        limit: number,
        page: number,
        token: string,
        search?: string,
        level?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        isActive?: number,
    ): Promise<{
        data: WasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    explanationOfWasteClassification(): Promise<DashboardWasteHierarchy[]>;
}
