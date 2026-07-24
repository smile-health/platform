import { getChannel } from '../../../../infrastructure/queue/rabbitmq/rabbitmq';
import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { handleScheduleEventForPartnershipUpdateMessage } from '../handlers/scheduleEventForPartnershipHandler';

export function listenToPartnershipStatusUpdateListenerQueue() {
    const channel = getChannel();

    channel.consume(rabbitmqConfig.PARTNERSHIP_STATUS_UPDATE.QUEUE_NAME, async (message) => {
        if (!message) {
            console.error('[RABBITMQ] Received null message');
            return;
        }
        try {
            const log = JSON.parse(message.content.toString());
            console.log('[RABBITMQ] Partnership Log:', log);

            await Promise.all([handleScheduleEventForPartnershipUpdateMessage(log)]);

            channel.ack(message); // Acknowledge the message
        } catch (error) {
            console.error('[RABBITMQ] Error processing message:', error);
            channel.nack(message, false, false); // Not acknowledge the message
        }
    });
}
