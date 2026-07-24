import type { Kysely } from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('ws_environmental_tests')
		.addColumn('management_asset_id', 'bigint')
		.execute()

	await db.schema
		.alterTable('ws_environmental_tests')
		.addForeignKeyConstraint(
			'fk_ws_environmental_tests_management_asset_id',
			['management_asset_id'],
			'ws_asset_inventories',
			['id']
		)
		.onDelete('set null')
		.onUpdate('cascade')
		.execute()
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('ws_environmental_tests')
		.dropConstraint('fk_ws_environmental_tests_management_asset_id')
		.execute()

	await db.schema
		.alterTable('ws_environmental_tests')
		.dropColumn('management_asset_id')
		.execute()
}
