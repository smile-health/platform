import { Kysely } from "kysely"
import { addAuditColumns, addTimestampColumns } from "../helper.js"
import { Database } from "../types/index.js"

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable("ws_microplanning_priority_areas")
    .addColumn("id", "bigint", (col) => col.autoIncrement().primaryKey())
    .addColumn("microplanning_id", "bigint", (col) =>
      col.notNull().references("ws_microplanning.id").onDelete("cascade")
    )
    .addColumn("village_id", "bigint", (col) => col.notNull())

    // -- Jumlah Sasaran 1 Tahun Sebelumnya --
    .addColumn("target_bayi_lahir", "integer")
    .addColumn("target_surviving_infants", "integer")

    // -- Capaian s.d. Desember 1 Tahun Sebelumnya --
    .addColumn("achievement_bcg", "integer")
    .addColumn("achievement_dpt1", "integer")
    .addColumn("achievement_dpt3", "integer")
    .addColumn("achievement_mr1", "integer")
    .addColumn("achievement_mr2", "integer")
    .addColumn("achievement_dpt4", "integer")

    // -- Capaian s.d. Desember 2 Tahun Sebelumnya --
    .addColumn("achievement_prev_dpt3", "integer")
    .addColumn("achievement_prev_mr1", "integer")

    // -- Penilaian Manual --
    .addColumn("has_supporting_condition", "smallint", (col) =>
      col.defaultTo(0)
    )
    .addColumn("has_pd3i_case", "smallint", (col) => col.defaultTo(0))
    .addColumn("priority_rank", "integer")

    .addColumn("status", "smallint", (col) => col.defaultTo(0))
    .$call(addAuditColumns)
    .$call(addTimestampColumns)
    .addUniqueConstraint("uq_priority_area_village", [
      "microplanning_id",
      "village_id",
    ])
    .addUniqueConstraint("uq_priority_area_rank", [
      "microplanning_id",
      "priority_rank",
    ])
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable("ws_microplanning_priority_areas").execute()
}
