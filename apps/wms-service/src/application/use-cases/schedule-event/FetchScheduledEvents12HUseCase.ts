import { redisLockConfig } from '../../../config/redis.config';
import ScheduledEvent from '../../../domain/entities/ScheduledEvent';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import { CacheLockingService } from '../../../domain/services/CacheLockingService';
import { ScheduledEventProcessService } from '../../../domain/services/ScheduledEventProcessService';
import { promisedTimeout } from '../../../shared/utils/promisedTimeout';

export default class FetchScheduledEvents12HUseCase {
    private retry_left: number;
    constructor(
        private readonly scheduledEventRepository: ScheduledEventRepository,
        private readonly cacheLockingService: CacheLockingService,
        private readonly scheduledEventProcessService: ScheduledEventProcessService,
    ) {
        if (!redisLockConfig.key) {
            throw new Error('Redis lock key is not configured.');
        } else if (!redisLockConfig.ttl) {
            throw new Error('Redis lock TTL is not configured.');
        } else if (!redisLockConfig.retryInterval) {
            throw new Error('Redis lock retry interval is not configured.');
        } else if (!redisLockConfig.retryCount) {
            throw new Error('Redis lock retry count is not configured.');
        }
        this.retry_left = +redisLockConfig.retryCount || 3;
    }

    async execute(): Promise<ScheduledEvent[]> {
        try {
            // Acquire redis lock with retry logic
            const lockAcquired = await this.cacheLockingService.acquireLock(
                redisLockConfig.key!,
                +redisLockConfig.ttl!,
            );
            if (!lockAcquired) {
                if (this.retry_left <= 0) {
                    throw new Error('[12H] Failed to acquire lock after multiple attempts.');
                }
                const scheduledEvents = await promisedTimeout(() => {
                    console.warn(`[12H] Retrying lock acquisition (${this.retry_left}/3)...`);
                    this.retry_left--;
                    return this.execute();
                }, +redisLockConfig.retryInterval!);
                return scheduledEvents;
            }
            console.log('[12H] Lock acquired successfully, processing scheduled events...');
            const scheduledEvents = await this.scheduledEventRepository.getEventsForDailyProcessing();

            console.log(`[12H] Found ${scheduledEvents.length} scheduled events for processing.`);
            // Push events to the redis queue
            for (const event of scheduledEvents) {
                try {
                    console.log(event, '[12H] Processing scheduled event...');
                    this.scheduledEventProcessService.publishScheduledEvent(event);
                } catch (error) {
                    console.error('[12H] Error processing scheduled event:', error);
                }
            }
            // Update the status of the events to 'processing'
            await this.scheduledEventRepository.updateEventsForProcessing(
                scheduledEvents.map((event) => event.id!),
            );

            // Release the lock after processing
            await this.cacheLockingService.releaseLock(redisLockConfig.key!);

            return scheduledEvents;
        } catch (error) {
            console.error('[12H] Error in FetchScheduledEventsUseCase:', error);
            throw new Error('[12H] Failed to fetch scheduled events');
        }
    }
}
