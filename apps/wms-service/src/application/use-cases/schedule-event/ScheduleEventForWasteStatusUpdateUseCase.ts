import ScheduledEvent from '../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import { logMessage } from '../../../shared/types/rabbitmq';

export default class ScheduleEventForWasteStatusUpdateUseCase {
    constructor(private readonly scheduledEventRepository: ScheduledEventRepository) {}

    async execute(data: logMessage) {
        // add more if statememt for waste storage (conld or not)
        if (
            data.event === 'WASTE_BAG_INTERNAL_LANDFILL_STARTED' ||
            data.event === 'WASTE_BAG_COLD_STORED_STARTED' ||
            data.event === 'WASTE_BAG_INCINERATION_STARTED' ||
            data.event === 'WASTE_BAG_STERILISED_STARTED' ||
            data.event === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER' ||
            data.event === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER' ||
            data.event === 'WASTE_BAG_FOLLOW_UP_TO_TRANSPORTER_EXTERNAL' ||
            data.event === 'WASTE_BAG_HANDOVER_TO_TRANSPORTER_EXTERNAL' ||
            data.event === 'WASTE_BAG_PICKUP_TO_TRANSPORTER_EXTERNAL' ||
            data.event === 'WASTE_BAG_HANDOVER_TO_TREATMENT_EXTERNAL' ||
            data.event === 'WASTE_BAG_RECEIVING_TO_TREATMENT_EXTERNAL' ||
            data.event === 'WASTE_BAG_STERILISED_EXTERNAL_STARTED' ||
            data.event === 'WASTE_BAG_INCENERATES_EXTERNAL_STARTED' ||
            data.event === 'WASTE_BAG_LANDFILLED_EXTERNAL_STARTED' ||
            data.event === 'WASTE_BAG_ALREADY_RECEIVED'
        ) {
            let event: ScheduledEvent = new ScheduledEvent({
                eventType: data.event,
                scheduledAt:
                    (data.metadata!.treatmentEndTime as Date) ?? (data.metadata!.endTime as Date),
                createdBy: data.metadata!.createdBy as string,
                metadata: JSON.stringify(data.metadata),
            });
            const scheduledEvent = await this.scheduledEventRepository.addEvent(event);
            return scheduledEvent;
        }
    }
}
