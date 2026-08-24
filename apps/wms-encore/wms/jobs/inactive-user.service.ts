import * as repo from "./inactive-user.repository";
import { notification } from "~encore/clients";

const FACILITY_PAGE_SIZE = Number(process.env.LIMIT_CRON_INACTIVE_USER_WASTE_BAG || 10);
const USER_PAGE_SIZE = Number(process.env.LIMIT_CRON_INACTIVE_USER || 10);

const NOTIF_TITLE = "notification.inactive_entity.title";
const NOTIF_TYPE = "notification.inactive_entity.message";

// Mirrors isSendDataNotif(user, item) from inActiveUserScheduler.ts: routes
// the alert to whichever admin scope actually owns the inactive facility.
// type 1 = province admin, 2 = regency admin, 3 = facility/operator; any
// other `type` never receives this notification (same as the original).
function isMatchingScope(userType: number | null, user: repo.UserWithFcmToken, item: repo.InactiveFacilityRow): boolean {
  if (userType === 1) return item.provinceId !== null && String(item.provinceId) === user.provinceId;
  if (userType === 2) return item.regencyId !== null && String(item.regencyId) === user.regencyId;
  if (userType === 3) return item.healthcareFacilityId === user.entityId;
  return false;
}

// Mirrors sendNotificationToInactiveUsers: writes one notification row per
// (user, matching inactive-facility) pair. `for_super_admin`/`for_admin`/
// `for_operator` are hardcoded true regardless of user.type, same as the
// original (unlike job 2's per-type stateNotif map).
async function notifyUser(user: repo.UserWithFcmToken, items: repo.InactiveFacilityRow[]): Promise<void> {
  for (const item of items) {
    if (!isMatchingScope(user.type, user, item)) continue;
    await notification.triggerPushNotification({
      userId: user.id,
      title: NOTIF_TITLE,
      message: JSON.stringify(item),
      type: NOTIF_TYPE,
    });
  }
}

// Mirrors notif-inactive-users (inActiveUserScheduler.ts) end to end: finds
// facilities whose waste-bag activity has gone quiet for exactly one of the
// tracked weekly milestones, then pushes an alert to every admin/operator in
// scope for that facility/regency/province.
//
// The original enqueued onto RabbitMQ for a downstream consumer to actually
// call FCM. That queue/consumer doesn't exist in wms-encore — instead, this
// pushes directly via notification's triggerPushNotification (Novu-backed,
// see notifyUser above and notification.service.ts), the same real-push
// mechanism every other notification-sending call site in this port uses.
export async function runInactiveUserNotifications(entityIds?: number[]): Promise<void> {
  let facilityOffset = 0;
  for (;;) {
    const facilities = await repo.findInactiveFacilities(entityIds, FACILITY_PAGE_SIZE, facilityOffset);
    if (facilities.length === 0) break;

    const facilityIds = [...new Set(facilities.map((f) => f.healthcareFacilityId))];

    let userOffset = 0;
    for (;;) {
      const users = await repo.findActiveUsersForEntities(facilityIds, USER_PAGE_SIZE, userOffset);
      if (users.length === 0) break;
      for (const user of users) {
        await notifyUser(user, facilities);
      }
      if (users.length < USER_PAGE_SIZE) break;
      userOffset += USER_PAGE_SIZE;
    }

    if (facilities.length < FACILITY_PAGE_SIZE) break;
    facilityOffset += FACILITY_PAGE_SIZE;
  }
}
