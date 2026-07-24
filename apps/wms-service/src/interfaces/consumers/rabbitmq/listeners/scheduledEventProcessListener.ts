import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { getChannel } from '../../../../infrastructure/queue/rabbitmq/rabbitmq';
import { handleScheduledEventForProcessingMessage } from '../handlers/processScheduledEventHandler';

export function listenToScheduledEventProcessQueue() {
    const channel = getChannel();

    channel.consume(rabbitmqConfig.SCHEDULED_EVENTS.QUEUE_NAME, async (message) => {
        if (!message) {
            console.error('[RABBITMQ] Received null message');
            return;
        }
        try {
            const event = JSON.parse(message.content.toString());
            // Here you would typically call a service to process the event
            await handleScheduledEventForProcessingMessage(event);
            channel.ack(message); // Acknowledge the message
        } catch (error) {
            console.error('[RABBITMQ] Error processing message:', error);
            channel.nack(message, false, false); // Not acknowledge the message
        }
    });
}
