import ScheduledEventRepository from '../../../../domain/repositories/ScheduleEventRepository';
import ScheduledEventRepositoryImpl from '../../../../infrastructure/database/repositories/ScheduledEventRepositoryImpl';
import { logMessage } from '../../../../shared/types/rabbitmq';
import ScheduleEventForManualScaleUseCase from '../../../../application/use-cases/schedule-event/ScheduleEventForManualScaleUseCase';

export async function handleScheduleEventForManualRequestUpdateMessage(
    payload: logMessage,
): Promise<void> {
    try {
        const repo: ScheduledEventRepository = new ScheduledEventRepositoryImpl();
        const useCase = new ScheduleEventForManualScaleUseCase(repo);

        useCase.execute(payload);
    } catch (error) {
        console.error('Error handling schedule event manual scale message:', error);
        throw new Error('Failed to handle schedule event manual scale message');
    }
}
