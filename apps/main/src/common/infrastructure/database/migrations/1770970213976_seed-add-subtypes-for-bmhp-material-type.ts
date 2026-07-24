import type { Kysely } from 'kysely'
import { DB } from "../types/db.js"

const materialSubtypes = [
    {
        name: "Reagen",
        material_type_id: 4,
    },
    {
        name: "Cleanser",
        material_type_id: 4,
    },
    {
        name: "Lyse",
        material_type_id: 4,
    },
    {
        name: "Thermal Paper",
        material_type_id: 4,
    },
    {
        name: "Tuberkulin",
        material_type_id: 4,
    },
]

export async function up(db: Kysely<DB>): Promise<void> {
    await db.insertInto("material_subtypes")
            .values(materialSubtypes)
            .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    for (const ms of materialSubtypes) {
        const materialSubtype = await db.selectFrom("material_subtypes")
            .select("id")
            .where("name", "=", ms.name)
            .executeTakeFirst()

        if (!materialSubtype) {
            continue
        }

        await db.deleteFrom("material_subtypes")
            .where("id", "=", materialSubtype.id)
            .executeTakeFirst()
    }
}