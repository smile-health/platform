import FetchScheduledEventsUseCase from '../../../application/use-cases/schedule-event/FetchScheduledEventsUseCase';
import ScheduledEventRepository from '../../../domain/repositories/ScheduleEventRepository';
import { CacheLockingService } from '../../../domain/services/CacheLockingService';
import { ScheduledEventProcessService } from '../../../domain/services/ScheduledEventProcessService';
import { RedisLockingImpl } from '../../../infrastructure/cache/repositories/RedisLockingImpl';
import ScheduledEventRepositoryImpl from '../../../infrastructure/database/repositories/ScheduledEventRepositoryImpl';
import { ScheduledEventProcessPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/ScheduledEventProcessPublisher';

export async function fetchScheduledEvents() {
    try {
        const scheduledEventRepository: ScheduledEventRepository =
            new ScheduledEventRepositoryImpl();
        const cacheLockingService: CacheLockingService = new RedisLockingImpl();
        const scheduledEventProcessService: ScheduledEventProcessService =
            new ScheduledEventProcessPublisher();

        const useCase = new FetchScheduledEventsUseCase(
            scheduledEventRepository,
            cacheLockingService,
            scheduledEventProcessService,
        );

        await useCase.execute();
    } catch (error) {
        console.error('Error fetching scheduled events:', error);
        throw new Error('Failed to fetch scheduled events');
    }
}
