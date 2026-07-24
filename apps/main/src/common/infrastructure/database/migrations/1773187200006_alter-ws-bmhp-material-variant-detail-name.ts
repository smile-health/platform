import type { Kysely } from "kysely"
import { sql } from "kysely"

/**
 * Alter ws_bmhp_material_variant_detail.name dari varchar(150) ke varchar(255)
 * karena data seed di 1773187200006 memiliki nilai name yang melebihi 150 karakter.
 */

export async function up(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE ws_bmhp_material_variant_detail MODIFY COLUMN name VARCHAR(255) NOT NULL`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`ALTER TABLE ws_bmhp_material_variant_detail MODIFY COLUMN name VARCHAR(150) NOT NULL`.execute(db)
}
