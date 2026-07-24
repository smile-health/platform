import { WhereOptions } from 'sequelize';
import UserRole from '../entities/UserRole';

export default interface WasteHierarchyRepository {
    getUserRole(
        limit: number,
        page: number,
        search?: string,
        lang?: string,
    ): Promise<{
        data: UserRole[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
