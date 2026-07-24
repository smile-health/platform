import { logMessage } from '../../shared/types/rabbitmq';
import WasteBagAuditTrail from '../entities/WasteBagAuditTrail';

export interface AuditTrilStoreService {
    storeAuditTrail(payload: logMessage): Promise<void>;
    getAllWasteBagAuditTrails(
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
    }>;
}
