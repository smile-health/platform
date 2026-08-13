import * as repo from "./manual-weighing-approval.repository";
import { notification } from "~encore/clients";

const PAGE_SIZE = Number(process.env.LIMIT_WASTE_BAG || 1000);
const USER_PAGE_SIZE = Number(process.env.LIMIT_USER || 1000);

const NOTIF_TITLE = "notification.update_status_manual_weighing_approval.title";
const NOTIF_TYPE = "notification.update_status_manual_weighing_approval.message";

async function notifyUsers(users: repo.ExactEntityUser[], items: repo.ExpiredApprovalRow[]): Promise<void> {
  for (const user of users) {
    for (const item of items) {
      // Mirrors sendNotificationToUsers's plain `item.entity_id ===
      // user.entity_id` check — no type-based scope routing here, unlike
      // jobs 1/3/4's isSendDataNotif.
      if (item.entityId !== user.entityId) continue;
      await notification.triggerPushNotification({
        userId: user.id,
        title: NOTIF_TITLE,
        message: JSON.stringify(item),
        type: NOTIF_TYPE,
      });
    }
  }
}

// Mirrors update-status-manual-weighing-approval
// (updateStatusManualWeighingApprovalScheduler.ts): expires manual-scale
// approval requests past their valid_until while still
// WAITING_FOR_APPROVAL, notifies the requesting facility's users, then
// marks them EXPIRED. Per the original, notification happens BEFORE the
// status write for each page — if the process crashes between the two, a
// retry will re-notify for rows not yet marked EXPIRED (same
// at-least-once-ish behavior as the original, not hardened here).
//
// Also mirrors a subtler quirk: offset increments by PAGE_SIZE every
// iteration (updateStatusManualWeighingApprovalScheduler.ts:136/205 do the
// same), even though each page's rows are marked EXPIRED right after being
// read — since the WHERE clause only matches WAITING_FOR_APPROVAL rows, the
// matching set shrinks after every page, so a fixed offset increment can
// skip over rows that shifted into view. Preserved rather than fixed (e.g.
// by always re-querying offset 0), since that's exactly what the original
// does.
export async function runManualWeighingApprovalExpiry(entityIds?: number[]): Promise<void> {
  let offset = 0;
  for (;;) {
    const expired = await repo.findExpiredManualScaleRequests(entityIds, PAGE_SIZE, offset);
    if (expired.length === 0) break;

    const facilityIds = [...new Set(expired.map((r) => r.entityId))];
    let userOffset = 0;
    const users: repo.ExactEntityUser[] = [];
    for (;;) {
      const page = await repo.findUsersForEntities(facilityIds, USER_PAGE_SIZE, userOffset);
      if (page.length === 0) break;
      users.push(...page);
      if (page.length < USER_PAGE_SIZE) break;
      userOffset += USER_PAGE_SIZE;
    }

    await notifyUsers(users, expired);
    await repo.markManualScaleRequestsExpired(expired.map((r) => r.id));

    if (expired.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
}
