import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('bmhp_approval_signatures')
    .addColumn('id', 'integer', (col) => col.unsigned().autoIncrement().primaryKey())
    .addColumn('user_id', 'bigint', (col) => col.notNull())
    .addColumn('name', 'varchar(150)', (col) => col.notNull())
    .addColumn('position', 'varchar(150)')
    .addColumn('signature_url', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn('deleted_at', 'datetime')
    .addColumn('created_by', 'bigint')
    .addColumn('updated_by', 'bigint')
    .addColumn('deleted_by', 'bigint')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('bmhp_approval_signatures').execute()
}
