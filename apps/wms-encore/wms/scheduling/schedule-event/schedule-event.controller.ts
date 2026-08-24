// Routes:
//
//   (private, no HTTP path) checkAndDispatchDueEvents — cron target, see
//   schedule-event.cron.ts. Not exposed publicly, and not called by anything
//   else — this service owns both the automatic in-process poller (mirroring
//   minuteInterval.ts) and the data it polls, end to end.
//
//   (private, no HTTP path) scheduleFollowUp / scheduleFollowUpForManualRequest /
//   scheduleFollowUpForPartnership — CORRECTION (previously wrong): these used
//   to be reached only via pub/sub (waste/partnership/manual-scale-request
//   published a status-update event, this service subscribed and reacted).
//   That indirection bought fan-out this relationship never needed — nobody
//   else subscribed to those topics — and it meant "was a follow-up actually
//   scheduled" wasn't observable to the caller. Now every producer calls
//   these directly via ~encore/clients whenever it has a ScheduledEventTrigger
//   to hand off, same as any other cross-service call in this app. Audit-trail
//   (waste-bag's OTHER subscriber, across all 9 milestone topics) is a genuinely
//   different relationship — it's fire-and-forget compliance logging that
//   should stay decoupled — so that topic and its subscription are unaffected.

import { api } from "encore.dev/api";
import * as service from "./schedule-event.service";
import type { ScheduledEventTrigger } from "../../messaging/topics";

export const checkAndDispatchDueEvents = api(
  {},
  async (): Promise<void> => {
    await service.checkAndDispatchDueEvents();
  }
);

export const scheduleFollowUp = api(
  {},
  async (req: {
    wasteBagId: number;
    previousStatus: string;
    newStatus: string;
    createdBy: string;
    scheduledEvent?: ScheduledEventTrigger;
  }): Promise<void> => {
    await service.scheduleFollowUp(req);
  }
);

export const scheduleFollowUpForManualRequest = api(
  {},
  async (req: {
    manualScaleRequestId: number;
    previousStatus: string;
    newStatus: string;
    createdBy: string;
    scheduledEvent?: ScheduledEventTrigger;
  }): Promise<void> => {
    await service.scheduleFollowUpForManualRequest(req);
  }
);

export const scheduleFollowUpForPartnership = api(
  {},
  async (req: {
    partnershipId: number;
    previousStatus: string;
    newStatus: string;
    createdBy: string;
    scheduledEvent?: ScheduledEventTrigger;
  }): Promise<void> => {
    await service.scheduleFollowUpForPartnership(req);
  }
);
