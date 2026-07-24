import ScheduleEventForWasteStatusUpdateUseCase from '../../../../application/use-cases/schedule-event/ScheduleEventForWasteStatusUpdateUseCase';
import ScheduledEventRepository from '../../../../domain/repositories/ScheduleEventRepository';
import ScheduledEventRepositoryImpl from '../../../../infrastructure/database/repositories/ScheduledEventRepositoryImpl';
import { logMessage } from '../../../../shared/types/rabbitmq';

export async function handleScheduleEventForWasteStatusUpdateMessage(
    payload: logMessage,
): Promise<void> {
    try {
        const repo: ScheduledEventRepository = new ScheduledEventRepositoryImpl();
        const useCase = new ScheduleEventForWasteStatusUpdateUseCase(repo);

        useCase.execute(payload);
    } catch (error) {
        console.error('Error handling schedule event message:', error);
        throw new Error('Failed to handle schedule event message');
    }
}
