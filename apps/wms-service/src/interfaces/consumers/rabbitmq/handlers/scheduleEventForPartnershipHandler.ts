import ScheduledEventRepository from '../../../../domain/repositories/ScheduleEventRepository';
import ScheduledEventRepositoryImpl from '../../../../infrastructure/database/repositories/ScheduledEventRepositoryImpl';
import { logMessage } from '../../../../shared/types/rabbitmq';
import ScheduleEventForPartnershipUseCase from '../../../../application/use-cases/schedule-event/ScheduleEventForPartnershipUseCase';

export async function handleScheduleEventForPartnershipUpdateMessage(
    payload: logMessage,
): Promise<void> {
    try {
        const repo: ScheduledEventRepository = new ScheduledEventRepositoryImpl();
        const useCase = new ScheduleEventForPartnershipUseCase(repo);

        useCase.execute(payload);
    } catch (error) {
        console.error('Error handling schedule event partnership message:', error);
        throw new Error('Failed to handle schedule event partnership message');
    }
}
