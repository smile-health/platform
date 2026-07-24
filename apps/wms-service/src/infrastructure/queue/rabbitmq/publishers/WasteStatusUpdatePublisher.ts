import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { WasteStatusUpdateService } from '../../../../domain/services/WasteStatusUpdateService';
import { logMessage } from '../../../../shared/types/rabbitmq';
import { getChannel } from '../rabbitmq';

export default class WasteStatusUpdatePublisher implements WasteStatusUpdateService {
    logInfo(message: string, event: string, metadata?: Record<string, unknown>): void {
        const log: logMessage = {
            level: 'INFO',
            message,
            event,
            timestamp: new Date().toISOString(),
            metadata,
        };

        const channel = getChannel();

        console.log('[RABBITMQ] publishing log', log);

        channel.publish(
            rabbitmqConfig.EXCHANGE,
            rabbitmqConfig.WASTE_STATUS_UPDATE.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );

        channel.waitForConfirms();
    }

    async logInfoAsync(message: string, event: string, metadata?: Record<string, unknown>): Promise<void> {
        const log: logMessage = {
            level: 'INFO',
            message,
            event,
            timestamp: new Date().toISOString(),
            metadata,
        };

        const channel = getChannel();

        console.log('[RABBITMQ] publishing log', log);

        channel.publish(
            rabbitmqConfig.EXCHANGE,
            rabbitmqConfig.WASTE_STATUS_UPDATE.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );

        await channel.waitForConfirms();
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
            rabbitmqConfig.WASTE_STATUS_UPDATE.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );
    }
}
