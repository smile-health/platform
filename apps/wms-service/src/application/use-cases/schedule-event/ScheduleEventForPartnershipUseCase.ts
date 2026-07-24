import ScheduledEvent from '../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import { logMessage } from '../../../shared/types/rabbitmq';

export default class ScheduleEventForPartnershipUseCase {
    constructor(private readonly scheduledEventRepository: ScheduledEventRepository) {}

    async execute(data: logMessage) {
        // add more if statememt for waste storage (conld or not)
        if (data.event === 'PARTNERSHIP_CONTRACT_EXPIRED') {
            let event: ScheduledEvent = new ScheduledEvent({
                eventType: data.event,
                scheduledAt: data.metadata!.endTime as Date,
                createdBy: data.metadata!.createdBy as string,
                metadata: JSON.stringify(data.metadata),
            });
            const scheduledEvent = await this.scheduledEventRepository.addEvent(event);
            return scheduledEvent;
        }
    }
}
