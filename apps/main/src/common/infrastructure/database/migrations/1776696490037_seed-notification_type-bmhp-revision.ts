import { type Kysely } from "kysely"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  const existing = await db
    .selectFrom("notification_types")
    .select("id")
    .where("type", "=", "bmhp-revision")
    .executeTakeFirst()

  if (!existing) {
    await db
      .insertInto("notification_types")
      .values({
        title: "notification.type.bmhp_revision",
        type: "bmhp-revision",
        fcm_enabled: 1,
        whatsapp_enabled: 0,
        email_enabled: 0,
      })
      .execute()
  }
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db
    .deleteFrom("notification_types")
    .where("type", "=", "bmhp-revision")
    .execute()
}
