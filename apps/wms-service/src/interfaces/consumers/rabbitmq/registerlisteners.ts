import { listenToScheduledEventProcessQueue } from './listeners/scheduledEventProcessListener';
import { listenToWasteStatusUpdateQueue } from './listeners/wasteStatusUpdateListener';
import { listenToPartnershipStatusUpdateListenerQueue } from './listeners/partnershipStatusUpdateListener';
import { listenToManualScaleRequestListenerQueue } from './listeners/manualRequestStatusUpdateListener';

export function registerRabbitListeners() {
    try {
        console.log('[RABBITMQ] Registering RabbitMQ listeners...');
        listenToWasteStatusUpdateQueue();
        listenToScheduledEventProcessQueue();
        listenToPartnershipStatusUpdateListenerQueue();
        listenToManualScaleRequestListenerQueue();
    } catch (error) {
        console.error('Error registering RabbitMQ listeners:', error);
        throw new Error('Failed to register RabbitMQ listeners');
    }
}
