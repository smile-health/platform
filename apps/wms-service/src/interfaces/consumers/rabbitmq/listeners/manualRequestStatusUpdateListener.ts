import { getChannel } from '../../../../infrastructure/queue/rabbitmq/rabbitmq';
import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { handleScheduleEventForManualRequestUpdateMessage } from '../handlers/scheduleEventForManualRequestHandler';

export function listenToManualScaleRequestListenerQueue() {
    const channel = getChannel();

    channel.consume(rabbitmqConfig.MANUAL_SCALE_REQUEST_STATUS.QUEUE_NAME, async (message) => {
        if (!message) {
            console.error('[RABBITMQ] Received null message');
            return;
        }
        try {
            const log = JSON.parse(message.content.toString());
            console.log('[RABBITMQ] manual scale request Log:', log);

            await Promise.all([handleScheduleEventForManualRequestUpdateMessage(log)]);

            channel.ack(message); // Acknowledge the message
        } catch (error) {
            console.error('[RABBITMQ] Error processing message:', error);
            channel.nack(message, false, false); // Not acknowledge the message
        }
    });
}
