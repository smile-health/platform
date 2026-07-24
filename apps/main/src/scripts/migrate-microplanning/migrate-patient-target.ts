import { db } from "@/common/infrastructure/database/index.js"
import { associateField } from "@smile-health/lib/utils.js"
import { sql } from "kysely";

const IMMUNIZATION_PROGRAM = 1;

const getEntityProgram = async (trx: any, entityIds: number[]) => {
    if (!entityIds.length) return {};
    const entities = await trx.selectFrom("ws_entities")
        .selectAll()
        .where("global_id", "in", entityIds)
        .where("program_id", "=", IMMUNIZATION_PROGRAM)
        .execute()
    return associateField(entities, "global_id", "id")
}

const populatePatientTarget = async (limit: number, page: number): Promise<boolean> => {
    const targets = await db.selectFrom("ws_targets")
        .selectAll()
        .limit(limit)
        .offset((page - 1) * limit)
        .execute()

    // Return false here so the loop actually stops
    if (!targets.length) return false

    await db.transaction().execute(async (trx) => {
        const entityIds = targets
            .filter(t => t.entity_id !== null)
            .map(t => t.entity_id as number)

        const entityMap = await getEntityProgram(trx, entityIds)

        const dataPatients = targets.map((target) => ({
            nik: target.nik?.toString() || "",
            name: target.name,
            gender: target.gender ?? 0,
            birth_date: target.date_of_birth,
            marital_status: target.marital_status ?? 0,
            education_id: target.education_id,
            occupation_id: target.occupation_id,
            religion_id: target.religion_id,
            ethnic_id: target.ethnic_id,
            identity_type: target.identity_type,
            entity_id: target.entity_id ? entityMap[target.entity_id] : null,
            phone_number: target.phone_number,
            address: target.registered_address,
            province_id: target.registered_province_id,
            regency_id: target.registered_regency_id,
            subdistrict_id: target.registered_subdistrict_id,
            village_id: target.registered_village_id,
            pos_code: target.registered_postal_code?.toString() || null,
            residential_address: target.residence_address,
            residential_province_id: target.residence_province_id,
            residential_regency_id: target.residence_regency_id,
            residential_subdistrict_id: target.residence_subdistrict_id,
            residential_village_id: target.residence_village_id,
            residential_pos_code: target.residence_postal_code?.toString() || null,
            created_at: target.created_at,
            updated_at: target.updated_at,
            deleted_at: target.deleted_at,
        }))

        await trx.insertInto("ws_patients")
            .values(dataPatients)
            .onDuplicateKeyUpdate({
                name: sql`values(name)`,
                gender: sql`values(gender)`,
                birth_date: sql`values(birth_date)`,
                marital_status: sql`values(marital_status)`,
                education_id: sql`values(education_id)`,
                occupation_id: sql`values(occupation_id)`,
                religion_id: sql`values(religion_id)`,
                ethnic_id: sql`values(ethnic_id)`,
                identity_type: sql`values(identity_type)`,
                entity_id: sql`values(entity_id)`,
                phone_number: sql`values(phone_number)`,
                address: sql`values(address)`,
                province_id: sql`values(province_id)`,
                regency_id: sql`values(regency_id)`,
                subdistrict_id: sql`values(subdistrict_id)`,
                village_id: sql`values(village_id)`,
                pos_code: sql`values(pos_code)`,
                residential_address: sql`values(residential_address)`,
                residential_province_id: sql`values(residential_province_id)`,
                residential_regency_id: sql`values(residential_regency_id)`,
                residential_subdistrict_id: sql`values(residential_subdistrict_id)`,
                residential_village_id: sql`values(residential_village_id)`,
                residential_pos_code: sql`values(residential_pos_code)`,
                updated_at: sql`values(updated_at)`,
                deleted_at: sql`values(deleted_at)`,
            }).executeTakeFirst()

        // Reuse dataPatients to build nikToId map 
        const insertedPatients = await trx.selectFrom("ws_patients")
            .select(["id", "nik"])
            .where("nik", "in", dataPatients.map(p => p.nik))
            .execute()
        const nikToId = associateField(insertedPatients, "nik", "id")

        const microplanningTargets = targets.map((target) => ({
            patient_id: nikToId[target.nik?.toString() || ""],
            microplanning_id: target.microplanning_id,
            target_group_id: target.target_group_id,
            created_at: target.created_at,
            updated_at: target.updated_at,
            deleted_at: target.deleted_at,
        }))

        await trx.insertInto("ws_microplanning_patient_targets")
            .values(microplanningTargets)
            .onDuplicateKeyUpdate({
                target_group_id: sql`values(target_group_id)`,
                updated_at: sql`values(updated_at)`,
                deleted_at: sql`values(deleted_at)`,
            }).executeTakeFirst()
    })

    return true
}

export const runPopulatePatientTarget = async (limit: number = 1000) => {
    console.log("Start migrate...")
    let page = 1
    while (await populatePatientTarget(limit, page++));
    console.log("Done.")
}