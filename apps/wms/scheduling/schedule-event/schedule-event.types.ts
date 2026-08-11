import type { ScheduledEventType } from "../../messaging/topics";

export interface ScheduledEvent {
  id: number;
  subjectId: number;
  eventType: ScheduledEventType;
  previousStatus: string;
  newStatus: string;
  scheduledAt: Date;
  createdAt: Date;
}
