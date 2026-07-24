import ScheduledEvents from '../entities/ScheduledEvent';

export default interface ScheduledEventRepository {
    addEvent(event: ScheduledEvents): Promise<ScheduledEvents>;
    getEventsForProcessing(): Promise<ScheduledEvents[]>;
    getEventsForDailyProcessing(): Promise<ScheduledEvents[]>;
    updateEventsForProcessing(ids: number[]): Promise<void>;
    removeEvent(id: number, deletedBy?: number): Promise<boolean>;
    failEvent(id: number): Promise<boolean>;
}
