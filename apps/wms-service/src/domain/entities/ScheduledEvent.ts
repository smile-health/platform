export default class ScheduledEvent {
    public id: number | undefined;
    public createdBy: string;
    public eventType: string;
    public scheduledAt: Date;
    public metadata: string | undefined;
    public createdAt?: Date;
    public status?: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
    public retryLeft?: number;

    constructor(scheduledEvent: {
        id?: number;
        createdBy: string;
        eventType: string;
        scheduledAt: Date;
        metadata?: string;
        createdAt?: Date;
        status?: 'PENDING' | 'IN_PROGRESS' | 'FAILED';
        retryLeft?: number;
    }) {
        this.id = scheduledEvent.id ?? undefined;
        this.createdBy = scheduledEvent.createdBy;
        this.eventType = scheduledEvent.eventType;
        this.scheduledAt = scheduledEvent.scheduledAt;
        this.metadata = scheduledEvent.metadata ?? undefined;
        this.createdAt = scheduledEvent.createdAt ?? new Date();
        this.status = scheduledEvent.status ?? 'PENDING';
        this.retryLeft = scheduledEvent.retryLeft ?? undefined;
    }
}
