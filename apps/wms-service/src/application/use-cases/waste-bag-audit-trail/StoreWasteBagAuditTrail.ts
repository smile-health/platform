import { AuditTrilStoreService } from '../../../domain/services/AuditTrailingService';
import { logMessage } from '../../../shared/types/rabbitmq';

export default class StoreWasteBagAuditTrailUseCase {
    constructor(private readonly auditTrilStoreService: AuditTrilStoreService) {}

    async execute(payload: logMessage): Promise<void> {
        try {
            await this.auditTrilStoreService.storeAuditTrail(payload);
        } catch (error) {
            console.error('Error storing audit trail:', error);
            throw new Error('Error storing audit trail ' + error);
        }
    }
}
