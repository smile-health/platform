import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { logMessage } from '../../../../shared/types/rabbitmq';
import { getChannel } from '../rabbitmq';
import { PartnershipStatusUpdateService } from '../../../../domain/services/PartnershipStatusUpdateService';

export default class PartnershipStatusUpdatePublisher implements PartnershipStatusUpdateService {
    logInfo(message: string, event: string, metadata?: Record<string, unknown>): void {
        const log: logMessage = {
            level: 'INFO',
            message,
            event,
            timestamp: new Date().toISOString(),
            metadata,
        };
        const channel = getChannel();

        channel.publish(
            rabbitmqConfig.EXCHANGE,
            rabbitmqConfig.PARTNERSHIP_STATUS_UPDATE.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );

        channel.waitForConfirms();
    }

    logError(error: Error, event: string, metadata?: Record<string, unknown>): void {
        const log: logMessage = {
            level: 'ERROR',
            message: error.message || 'An error occurred',
            event,
            timestamp: new Date().toISOString(),
            metadata,
        };
        const channel = getChannel();

        channel.publish(
            rabbitmqConfig.EXCHANGE,
            rabbitmqConfig.PARTNERSHIP_STATUS_UPDATE.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );
    }
}
