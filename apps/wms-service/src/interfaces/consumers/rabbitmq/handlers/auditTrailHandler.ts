import StoreWasteBagAuditTrailUseCase from '../../../../application/use-cases/waste-bag-audit-trail/StoreWasteBagAuditTrail';
import WasteBagAuditTrailRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagAuditTrailRepositoryImpl';
import { logMessage } from '../../../../shared/types/rabbitmq';

export async function handleAuditTrailMessage(payload: logMessage): Promise<void> {
    try {
        const repo = new WasteBagAuditTrailRepositoryImpl();
        const useCase = new StoreWasteBagAuditTrailUseCase(repo);

        useCase.execute(payload);
    } catch (error) {
        console.error('Error handling audit trail message:', error);
        throw new Error('Failed to handle audit trail message');
    }
}
