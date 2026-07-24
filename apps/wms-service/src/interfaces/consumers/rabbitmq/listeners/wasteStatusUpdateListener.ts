import { getChannel } from '../../../../infrastructure/queue/rabbitmq/rabbitmq';
import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { handleAuditTrailMessage } from '../handlers/auditTrailHandler';
import { handleScheduleEventForWasteStatusUpdateMessage } from '../handlers/scheduleEventForWasteStatusUpdateHandler';

export function listenToWasteStatusUpdateQueue() {
    const channel = getChannel();

    channel.consume(rabbitmqConfig.WASTE_STATUS_UPDATE.QUEUE_NAME, async (message) => {
        if (!message) {
            console.error('[RABBITMQ] Received null message');
            return;
        }
        try {
            const log = JSON.parse(message.content.toString());

            console.log('[RABBITMQ] Audit Log:', log);
            await Promise.all([
                handleAuditTrailMessage(log),
                handleScheduleEventForWasteStatusUpdateMessage(log),
            ]);

            channel.ack(message); // Acknowledge the message
        } catch (error) {
            console.error('[RABBITMQ] Error processing message:', error);
            channel.nack(message, false, false); // Not acknowledge the message
        }
    });
}
