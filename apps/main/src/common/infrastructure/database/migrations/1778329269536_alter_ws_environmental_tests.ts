import type { Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('ws_environmental_tests')
		.addColumn('examination_entity_id', 'bigint')
		.execute()

	await db.schema
		.alterTable('ws_environmental_tests')
		.addForeignKeyConstraint(
			'fk_ws_environmental_tests_examination_entity_id',
			['examination_entity_id'],
			'entities',
			['id']
		)
		.onDelete('set null')
		.onUpdate('cascade')
		.execute()

	await db.schema
		.createIndex('idx_ws_environmental_tests_examination_entity_id')
		.on('ws_environmental_tests')
		.column('examination_entity_id')
		.execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.dropIndex('idx_ws_environmental_tests_examination_entity_id')
		.on('ws_environmental_tests')
		.execute()

	await db.schema
		.alterTable('ws_environmental_tests')
		.dropConstraint('fk_ws_environmental_tests_examination_entity_id')
		.execute()

	await db.schema
		.alterTable('ws_environmental_tests')
		.dropColumn('examination_entity_id')
		.execute()
}
