import type { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper"

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Buat tabel humidity thresholds
  await db.schema
    .createTable("humidity_thresholds")
    .addColumn("id", "bigint", (col) => col.primaryKey().autoIncrement())
    .addColumn("min_humidity", "double precision", (col) => col.notNull())
    .addColumn("max_humidity", "double precision", (col) => col.notNull())
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  // 2. Buat table asset type humidity
  await db.schema
    .createTable("asset_type_humidity")
    .addColumn("id", "bigint", (col) => col.primaryKey().autoIncrement())
    .addColumn("asset_type_id", "bigint", (col) =>
      col.notNull().references("asset_types.id").onDelete("cascade")
    )
    .addColumn("humidity_threshold_id", "bigint", (col) =>
      col.references("humidity_thresholds.id").onDelete("cascade")
    )
    .$call(addTimestampColumns)
    .$call(addAuditColumns)
    .execute()

  // 3. Buat seed data humidity thresholds
  const humidityThresholds = [{ min_humidity: 60, max_humidity: 80 }]

  for (const threshold of humidityThresholds) {
    await db.insertInto("humidity_thresholds").values(threshold).execute()
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("asset_type_humidity").execute()
  await db.schema.dropTable("humidity_thresholds").execute()
}
