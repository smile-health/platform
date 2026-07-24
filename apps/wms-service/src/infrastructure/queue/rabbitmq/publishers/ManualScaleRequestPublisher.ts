import rabbitmqConfig from '../../../../config/rabbitmq.config';
import { logMessage } from '../../../../shared/types/rabbitmq';
import { getChannel } from '../rabbitmq';
import { ManualScaleRequestService } from '../../../../domain/services/ManualScaleRequestService';

export default class ManualScaleRequestPublisher implements ManualScaleRequestService {
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
            rabbitmqConfig.MANUAL_SCALE_REQUEST_STATUS.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );
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
            rabbitmqConfig.MANUAL_SCALE_REQUEST_STATUS.ROUTING_KEY,
            Buffer.from(JSON.stringify(log)),
            {
                persistent: true,
            },
        );
    }
}
