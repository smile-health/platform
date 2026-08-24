// The original notification module's public read/write HTTP API
// (GET /notification, GET /notification/type, GET /notification/count,
// PATCH /notification/:id/read, PATCH /notification/read, and the five
// POST /notification/trigger-* endpoints) is intentionally NOT ported here.
// The team has moved to Novu for notification delivery and no longer reads
// or writes the legacy `notifications` table through this service — those
// endpoints are unused. The only piece that's still live is
// triggerPushNotification below, the internal RPC every other service in
// this app calls to fire a Novu workflow (see notification.service.ts).
import { api } from "encore.dev/api";
import * as service from "./notification.service";

// Internal-only (no method/path/expose) — callable via ~encore/clients from
// callers with no natural existing domain event to piggyback on: cron jobs
// (jobs/*.service.ts — a scheduled batch run isn't an "event" another service
// reacts to) and partnership (no topic exists there anymore since scheduling
// moved to a direct call too — see messaging/topics.ts's note). Where a real
// domain event DOES already exist for the occurrence — waste-bag's
// waste-bag's 9 milestone topics (messaging/topics.ts) — this service
// subscribes to the relevant ones directly (see notification.subscriptions.ts)
// and decides whether/what to notify itself, rather than being called
// directly or relayed a pre-built notification payload.
export const triggerPushNotification = api(
  {},
  async (req: service.TriggerPushNotificationInput): Promise<void> => {
    await service.triggerPushNotification(req);
  }
);
