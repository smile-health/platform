import { sql, type Kysely } from "kysely"
import { Database } from "../types/index.js"

const TABLE_NAME = "ws_material_targets"

export async function up(db: Kysely<Database>): Promise<void> {
	// await sql`TRUNCATE TABLE ${sql.table(TABLE_NAME)}`.execute(db)

	const data_target_non_bias_additional = [5319, 5317, 5315, 4110, 4111]

	const data_target_bias_additional = [5319, 5317, 4110, 4111]

	const existing = await db.selectFrom(TABLE_NAME).select(["id"]).execute()

	const existingMaterialIds = new Set(existing.map((entry) => entry.id))

		const insertsNonBiasAdditional: Array<{
		material_id: number
		category: "non_bias"
		type: "additional"
	}> = []

	for (const materialId of data_target_non_bias_additional) {
		const materials = await db
			.selectFrom("ws_materials")
			.select(["id"])
			.where("global_id", "=", materialId)
			.where("program_id", "=", 1)
			.where("material_level_id", "=", 3)
			.execute()

		for (const material of materials) {
			if (!existingMaterialIds.has(material.id)) {
				insertsNonBiasAdditional.push({
					material_id: material.id,
					category: "non_bias",
					type: "additional",
				})
			}
		}
	}

	if (insertsNonBiasAdditional.length > 0) {
		await db.insertInto(TABLE_NAME).values(insertsNonBiasAdditional).execute()
	}

	const insertsBiasAdditional: Array<{
		material_id: number
		category: "bias"
		type: "additional"
		injection_month: string
	}> = []

	for (const materialId of data_target_bias_additional) {
		const materials = await db
			.selectFrom("ws_materials")
			.select(["id"])
			.where("global_id", "=", materialId)
			.where("program_id", "=", 1)
			.where("material_level_id", "=", 3)
			.execute()

		for (const material of materials) {
			if (!existingMaterialIds.has(material.id)) {
				if (materialId !== 4168) {
					insertsBiasAdditional.push({
						material_id: material.id,
						category: "bias",
						type: "additional",
						injection_month: "november",
					})
				}
				insertsBiasAdditional.push({
					material_id: material.id,
					category: "bias",
					type: "additional",
					injection_month: "august",
				})
			}
		}
	}

	if (insertsBiasAdditional.length > 0) {
		await db.insertInto(TABLE_NAME).values(insertsBiasAdditional).execute()
	}
}

export async function down(db: Kysely<Database>): Promise<void> {
	await sql`TRUNCATE TABLE ${sql.table(TABLE_NAME)}`.execute(db)
}
