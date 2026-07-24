import WasteBagAuditTrail from '../../../domain/entities/WasteBagAuditTrail';
import { AuditTrilStoreService } from '../../../domain/services/AuditTrailingService';

export default class GetAllWasteBagAuditTrailUseCase {
    constructor(private readonly repo: AuditTrilStoreService) {}
    async executeAll(
        limit: number,
        page: number,
        search?: string,
        wasteBagId?: string,
        healthcareFacilityId?: string,
        transporterId?: string,
        thirdPartyProviderId?: string,
    ): Promise<{
        data: WasteBagAuditTrail[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const userRole = await this.repo.getAllWasteBagAuditTrails(
                limit,
                page,
                search,
                wasteBagId,
                healthcareFacilityId,
                transporterId,
                thirdPartyProviderId,
            );
            console.log('Fetched all user role successfully:', userRole);
            return userRole;
        } catch (error) {
            console.error('Error fetching all user role:', error);
            throw new Error('Error fetching all user role');
        }
    }
}
