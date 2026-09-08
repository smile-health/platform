import type { Kysely } from 'kysely'
import { Database } from '../types/index.js'

export async function seed(db: Kysely<Database>): Promise<void> {
	const tableName = 'budget_sources'

	const budgetSources = [
		{
			id: 1,
			name: 'Other',
			description: null,
			created_by: null,
			updated_by: null,
			deleted_by: null,
			is_restricted: 0,
			is_custom: 1,
		},
	]

	for (const source of budgetSources) {
		await db
			.insertInto(tableName)
			.values(source)
			.onDuplicateKeyUpdate({
				name: source.name,
				description: source.description,
				is_restricted: source.is_restricted,
				is_custom: source.is_custom,
			})
			.execute()
	}

	console.log('Budget sources seeded.')
}
