import ProcessScheduledEventUseCase from '../../../../application/use-cases/schedule-event/ProcessScheduledEventUseCase';
import ScheduledEvent from '../../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../../domain/repositories/ScheduleEventRepository';
import WasteBagRepository from '../../../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../../../domain/services/WasteStatusUpdateService';
import ScheduledEventRepositoryImpl from '../../../../infrastructure/database/repositories/ScheduledEventRepositoryImpl';
import WasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import WasteStatusUpdatePublisher from '../../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import PartnershipRepositoryImpl from '../../../../infrastructure/database/repositories/PartnershipRepositoryImpl';
import PartnershipStatusUpdatePublisher from '../../../../infrastructure/queue/rabbitmq/publishers/PartnershipStatusUpdatePublisher';
import ManualScaleRequestRepositoryImpl from '../../../../infrastructure/database/repositories/ManualScaleRequestRepositoryImpl';
import ManualScaleRequestPublisher from '../../../../infrastructure/queue/rabbitmq/publishers/ManualScaleRequestPublisher';
import { NotificationPublisher } from '../../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';

export async function handleScheduledEventForProcessingMessage(
    payload: ScheduledEvent,
): Promise<void> {
    try {
        const wasteBagRepository: WasteBagRepository = new WasteBagRepositoryImpl();
        const scheduledEventRepository: ScheduledEventRepository =
            new ScheduledEventRepositoryImpl();
        const wasteStatusUpdateService: WasteStatusUpdateService = new WasteStatusUpdatePublisher();

        // partnerhsip repository and publisher
        const partnershipRepositoryImpl = new PartnershipRepositoryImpl();
        const partnershipStatusUpdatePublisher = new PartnershipStatusUpdatePublisher();

        // manual scale request
        const manualSclaeRequestRepositoryImpl = new ManualScaleRequestRepositoryImpl();
        const manualSclaeRequestPublisher = new ManualScaleRequestPublisher();

        const notificationRepository = new NotificationPublisher();

        const useCase = new ProcessScheduledEventUseCase(
            wasteBagRepository,
            scheduledEventRepository,
            wasteStatusUpdateService,
            partnershipRepositoryImpl,
            partnershipStatusUpdatePublisher,
            manualSclaeRequestRepositoryImpl,
            manualSclaeRequestPublisher,
            notificationRepository,
        );

        useCase.execute(payload);
    } catch (error) {
        console.error('Error handling scheduled event for processing message:', error);
        throw new Error('Failed to handle scheduled event for processing message');
    }
}
