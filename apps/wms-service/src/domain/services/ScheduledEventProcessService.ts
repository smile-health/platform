import ScheduledEvent from '../entities/ScheduledEvent';

export interface ScheduledEventProcessService {
    publishScheduledEvent(event: ScheduledEvent): void;
}
