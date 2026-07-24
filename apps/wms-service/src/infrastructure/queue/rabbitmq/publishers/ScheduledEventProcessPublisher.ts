import rabbitmqConfig from '../../../../config/rabbitmq.config';
import ScheduledEvent from '../../../../domain/entities/ScheduledEvent';
import { ScheduledEventProcessService } from '../../../../domain/services/ScheduledEventProcessService';
import { getChannel } from '../rabbitmq';

export class ScheduledEventProcessPublisher implements ScheduledEventProcessService {
    publishScheduledEvent(event: ScheduledEvent): void {
        const channel = getChannel();

        channel.publish(
            rabbitmqConfig.EXCHANGE,
            rabbitmqConfig.SCHEDULED_EVENTS.ROUTING_KEY,
            Buffer.from(JSON.stringify(event)),
            {
                persistent: true,
            },
        );
    }
}
