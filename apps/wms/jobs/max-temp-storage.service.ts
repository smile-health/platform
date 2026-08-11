import * as repo from "./max-temp-storage.repository";
import { notification } from "~encore/clients";

const BAG_PAGE_SIZE = Number(process.env.LIMIT_WASTE_BAG || 1000);
const USER_PAGE_SIZE = Number(process.env.LIMIT_USER || 1000);

const NOTIF_TITLE = "notification.maximum_temporary_storage.title";
const NOTIF_TYPE = "notification.maximum_temporary_storage.message";

// Mirrors isSendDataNotif — same per-type scope routing as inactive-user
// .service.ts's isMatchingScope (type 1 = province, 2 = regency, 3 =
// facility), reused verbatim by jobs 3 and 4 in the original.
function isMatchingScope(user: repo.BroadUser, item: repo.OverThresholdBag): boolean {
  if (user.type === 1) return item.provinceId !== null && String(item.provinceId) === user.provinceId;
  if (user.type === 2) return item.regencyId !== null && String(item.regencyId) === user.regencyId;
  if (user.type === 3) return item.healthcareFacilityId === user.entityId;
  return false;
}

async function notifyUser(user: repo.BroadUser, items: repo.OverThresholdBag[]): Promise<void> {
  for (const item of items) {
    if (!isMatchingScope(user, item)) continue;
    await notification.triggerPushNotification({
      userId: user.id,
      title: NOTIF_TITLE,
      message: JSON.stringify(item),
      type: NOTIF_TYPE,
    });
  }
}

// Mirrors max-temporary-storage-duration
// (maximumTemporaryStorageDurationScheduler.ts): finds waste bags that have
// overstayed their classification's max temporary-storage duration and
// notifies province/regency/facility admins in scope. Read-only — unlike
// job 5, this never mutates the bag's own status.
export async function runMaxTemporaryStorageDuration(entityIds?: number[]): Promise<void> {
  let offset = 0;
  for (;;) {
    const bags = await repo.findBagsOverTempStorageThreshold(entityIds, BAG_PAGE_SIZE, offset);
    if (bags.length === 0) break;

    const facilityIds = [...new Set(bags.map((b) => b.healthcareFacilityId))];
    const regencyIds = [...new Set(bags.map((b) => b.regencyId).filter((v): v is number => v !== null))];
    const provinceIds = [...new Set(bags.map((b) => b.provinceId).filter((v): v is number => v !== null))];

    let userOffset = 0;
    for (;;) {
      const users = await repo.findUsersInScope(facilityIds, regencyIds, provinceIds, USER_PAGE_SIZE, userOffset);
      if (users.length === 0) break;
      for (const user of users) {
        await notifyUser(user, bags);
      }
      if (users.length < USER_PAGE_SIZE) break;
      userOffset += USER_PAGE_SIZE;
    }

    if (bags.length < BAG_PAGE_SIZE) break;
    offset += BAG_PAGE_SIZE;
  }
}
