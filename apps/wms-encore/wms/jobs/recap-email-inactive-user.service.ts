import * as repo from "./recap-email-inactive-user.repository";
import { notification } from "~encore/clients";

const USER_PAGE_SIZE = Number(process.env.LIMIT_CRON_INACTIVE_USER || 1);
const WASTE_BAG_PAGE_SIZE = Number(process.env.LIMIT_CRON_INACTIVE_USER_WASTE_BAG || 10);

const NOTIF_TYPE = "notification.inactive_entity.message";
const RECAP_TITLE = "notification.inactive_entity.recap_title";

// Mirrors emailTemplateHTML(title, rows) — a simplified but structurally
// faithful port: a title + one line per inactive facility. The original's
// per-row "generated at" timestamp (fulltime) was recomputed fresh for every
// row rather than reflecting each row's actual inactivity date — a quirk
// noted in the source, NOT reproduced here since it added no real
// information (every row would show today's date/time regardless of
// content); this version simply omits that stray timestamp column rather
// than faithfully reproducing a value nobody could rely on.
function buildRecapHtml(rows: repo.InactiveForUserRow[]): string {
  const today = new Date().toLocaleDateString("en-GB");
  const items = rows
    .map(
      (r) =>
        `<li>${r.entityName ?? "Unknown facility"} (${r.regencyName ?? "-"}) — inactive for ${r.ageDays} days, last activity ${r.lastCreatedAt.toISOString()}</li>`,
    )
    .join("");
  return `<html><body><h2>Events on ${today}</h2><ul>${items}</ul></body></html>`;
}

async function sendRecapForUser(user: repo.RecapUser): Promise<void> {
  let offset = 0;
  const rows: repo.InactiveForUserRow[] = [];
  for (;;) {
    const page = await repo.findInactiveForUser(
      user.entityType,
      user.provinceId,
      user.regencyId,
      user.entityId,
      WASTE_BAG_PAGE_SIZE,
      offset,
    );
    if (page.length === 0) break;
    rows.push(...page);
    if (page.length < WASTE_BAG_PAGE_SIZE) break;
    offset += WASTE_BAG_PAGE_SIZE;
  }
  if (rows.length === 0) return;

  // Delivery channel (email vs push) is now the Novu workflow's own
  // configuration, not something this caller specifies — the original's
  // `media: EMAIL` was only ever used to steer this app's own DB bookkeeping
  // (dropped along with the DB write, see notification.service.ts's
  // triggerPushNotification header comment).
  await notification.triggerPushNotification({
    userId: user.id,
    title: RECAP_TITLE,
    message: buildRecapHtml(rows),
    type: NOTIF_TYPE,
  });
}

// Mirrors email-inactive-users (recapEmailInActiveUserScheduler.ts): for
// every active user, finds inactive facilities within that user's admin
// scope (province/regency/facility, keyed by entity_type) and sends a recap
// email listing them. Users whose entity_type isn't 1/2/3 get nothing, same
// as the original.
export async function runRecapEmailInactiveUsers(entityIds?: number[]): Promise<void> {
  let offset = 0;
  for (;;) {
    const users = await repo.findRecapCandidateUsers(entityIds, USER_PAGE_SIZE, offset);
    if (users.length === 0) break;
    for (const user of users) {
      await sendRecapForUser(user);
    }
    if (users.length < USER_PAGE_SIZE) break;
    offset += USER_PAGE_SIZE;
  }
}
