import { Kysely, sql } from "kysely"
import { DB } from "../types/db.js"

/**
 * ws_microplanning.entity_id and ws_targets.entity_id were stored using
 * ws_entities.global_id (cross-service ID).
 * This migration converts them to ws_entities.id (local PK).
 *
 * Safe: only updates rows where entity_id matches an existing global_id in ws_entities.
 * Rows already using local id (no matching global_id) are not touched.
 */
export async function up(db: Kysely<DB>): Promise<void> {
  await sql`
    UPDATE ws_microplanning wm
    INNER JOIN ws_entities we ON we.global_id = wm.entity_id
    SET wm.entity_id = we.id
    WHERE wm.deleted_at IS NULL
    AND we.program_id = 1
  `.execute(db)

  await sql`
    UPDATE ws_targets wt
    INNER JOIN ws_entities we ON we.global_id = wt.entity_id
    SET wt.entity_id = we.id
    WHERE wt.deleted_at IS NULL
    AND we.program_id = 1
  `.execute(db)

  await sql`
    UPDATE ws_material_needs wmn
    INNER JOIN ws_entities we ON we.global_id = wmn.reference_id AND wmn.reference_type = 'school'
    SET wmn.reference_id = we.id
    WHERE wmn.deleted_at IS NULL
    AND we.program_id = 1
  `.execute(db)

  await sql`
    UPDATE ws_microplan_absolute_target wmat
    INNER JOIN ws_entities we ON we.global_id = wmat.reff_id AND wmat.reff_type = 'school'
    SET wmat.reff_id = we.id
    WHERE wmat.deleted_at IS NULL
    AND we.program_id = 1
  `.execute(db)

  await sql`
    UPDATE ws_school_estimation_details wsed
    INNER JOIN ws_entities we ON we.global_id = wsed.school_id
    SET wsed.school_id = we.id
    WHERE wsed.deleted_at IS NULL
    AND we.program_id = 1
  `.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
  await sql`
    UPDATE ws_microplanning wm
    INNER JOIN ws_entities we ON we.id = wm.entity_id
    SET wm.entity_id = we.global_id
    WHERE wm.deleted_at IS NULL
  `.execute(db)

  await sql`
    UPDATE ws_targets wt
    INNER JOIN ws_entities we ON we.id = wt.entity_id
    SET wt.entity_id = we.global_id
    WHERE wt.deleted_at IS NULL
  `.execute(db)

  await sql`
    UPDATE ws_material_needs wmn
    INNER JOIN ws_entities we ON we.id = wmn.reference_id AND wmn.reference_type = 'school'
    SET wmn.reference_id = we.global_id
    WHERE wmn.deleted_at IS NULL
  `.execute(db)

  await sql`
    UPDATE ws_microplan_absolute_target wmat
    INNER JOIN ws_entities we ON we.id = wmat.reff_id AND wmat.reff_type = 'school'
    SET wmat.reff_id = we.global_id
    WHERE wmat.deleted_at IS NULL
  `.execute(db)

  await sql`
    UPDATE ws_school_estimation_details wsed
    INNER JOIN ws_entities we ON we.id = wsed.school_id
    SET wmat.school_id = we.global_id
    WHERE wsed.deleted_at IS NULL
  `.execute(db)
}
