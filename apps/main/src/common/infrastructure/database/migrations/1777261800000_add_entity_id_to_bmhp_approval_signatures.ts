import { type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Add entity_id column to bmhp_approval_signatures
  // This links a KAKO user's signature to a specific KAKO entity they represent
  await db.schema
    .alterTable('bmhp_approval_signatures')
    .addColumn('entity_id', 'integer', (col) => col.unsigned())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('bmhp_approval_signatures')
    .dropColumn('entity_id')
    .execute()
}
