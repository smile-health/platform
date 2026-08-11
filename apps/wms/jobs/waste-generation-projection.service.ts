import * as repo from "./waste-generation-projection.repository";
import { findUsersInScope, type BroadUser } from "./max-temp-storage.repository";
import { notification } from "~encore/clients";

const BAG_PAGE_SIZE = Number(process.env.LIMIT_WASTE_BAG || 1000);
const USER_PAGE_SIZE = Number(process.env.LIMIT_USER || 1000);

// Typo ("generartion") preserved verbatim from
// wasteGenerationBelowMonthlyProjectionScheduler.ts's own i18n keys — fixing
// it here would silently break whatever i18n resource/Novu-workflow lookup
// (if any) already depends on the misspelled key.
const NOTIF_TITLE = "notification.waste_generartion_below_monthly_projection.title";
const NOTIF_TYPE = "notification.waste_generartion_below_monthly_projection.message";

// Mirrors getHalfMonthRange(): current month, day 1 through day 15
// (inclusive), in local/WIB wall-clock terms — no explicit TZ math in JS
// here, matching the original (the SQL side does the +07:00 conversion
// explicitly; see repository.ts).
function getHalfMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return {
    startDate: `${year}-${month}-01 00:00:00`,
    endDate: `${year}-${month}-15 23:59:59`,
  };
}

// Mirrors formatWeight(): a locale-heuristic formatter (comma -> assume
// Indonesian grouped decimal, else plain) feeding an id-ID Intl formatter.
// Fragile by construction in the original; preserved faithfully rather than
// hardened, since hardening it would change the displayed numbers.
function formatWeight(value: number | string): string {
  if (value === null || value === undefined || value === ("" as unknown)) return "0";
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    const str = String(value);
    num = str.includes(",") ? Number(str.replace(/\./g, "").replace(",", ".")) : Number(str);
  }
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(num);
}

function isMatchingScope(user: BroadUser, item: repo.BelowProjectionRow): boolean {
  if (user.type === 1) return item.provinceId !== null && String(item.provinceId) === user.provinceId;
  if (user.type === 2) return item.regencyId !== null && String(item.regencyId) === user.regencyId;
  if (user.type === 3) return item.healthcareFacilityId === user.entityId;
  return false;
}

async function notifyUser(user: BroadUser, items: repo.BelowProjectionRow[]): Promise<void> {
  for (const item of items) {
    if (!isMatchingScope(user, item)) continue;
    await notification.triggerPushNotification({
      userId: user.id,
      title: NOTIF_TITLE,
      message: JSON.stringify({
        ...item,
        totalWeight: formatWeight(item.totalWeight),
        projectionWeight: formatWeight(item.projectionWeight),
        avgWeight: formatWeight(item.avgWeight),
      }),
      type: NOTIF_TYPE,
    });
  }
}

// Mirrors waste-generation-below-monthly-projection
// (wasteGenerationBelowMonthlyProjectionScheduler.ts): flags facility +
// waste-characteristic combos whose first-half-of-month actual weight is
// below half their trailing 3-month average, and notifies province/regency/
// facility admins in scope. Read-only.
export async function runWasteGenerationBelowProjection(entityIds?: number[]): Promise<void> {
  const { startDate, endDate } = getHalfMonthRange();
  let offset = 0;
  for (;;) {
    const rows = await repo.findBagsBelowMonthlyProjection(startDate, endDate, entityIds, BAG_PAGE_SIZE, offset);
    if (rows.length === 0) break;

    const facilityIds = [...new Set(rows.map((r) => r.healthcareFacilityId))];
    const regencyIds = [...new Set(rows.map((r) => r.regencyId).filter((v): v is number => v !== null))];
    const provinceIds = [...new Set(rows.map((r) => r.provinceId).filter((v): v is number => v !== null))];

    let userOffset = 0;
    for (;;) {
      const users = await findUsersInScope(facilityIds, regencyIds, provinceIds, USER_PAGE_SIZE, userOffset);
      if (users.length === 0) break;
      for (const user of users) {
        await notifyUser(user, rows);
      }
      if (users.length < USER_PAGE_SIZE) break;
      userOffset += USER_PAGE_SIZE;
    }

    if (rows.length < BAG_PAGE_SIZE) break;
    offset += BAG_PAGE_SIZE;
  }
}
