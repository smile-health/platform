import { db } from "@/common/infrastructure/database/index.js"
import { doEncrypt } from "@/modules/transaction/utils/transaction.encryption.js"
import { SCHOOL_ENTITY_TAG_ID } from "@/common/constants/target.js"

async function verifySchool(schoolId: number) {
  const school = await db
    .selectFrom("entities")
    .select(["id", "name", "sub_district_id"])
    .where("id", "=", schoolId)
    .where("entity_tag_id", "=", SCHOOL_ENTITY_TAG_ID)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!school) throw new Error(`School ID ${schoolId} not found or not a school entity`)

  console.log(`  School      : ${school.id} - ${school.name} (subdistrict=${school.sub_district_id})`)
  return school
}

async function fixOne(nik: string, schoolId: number) {
  const encryptedNik = doEncrypt(nik)

  const target = await db
    .selectFrom("ws_targets")
    .select(["id", "entity_id", "target_group_id", "nik"])
    .where("nik", "=", encryptedNik)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!target) {
    console.error(`  ERROR: No active target found for NIK ${nik}`)
    return
  }

  console.log(`  Found target ID: ${target.id}, current entity_id=${target.entity_id}, target_group_id=${target.target_group_id}`)

  await db
    .updateTable("ws_targets")
    .set({
      entity_id: schoolId,
      updated_at: new Date(),
    })
    .where("id", "=", target.id)
    .execute()

  console.log(`  ✅ Updated target ID ${target.id}: entity_id=${target.entity_id} → ${schoolId}`)
}

export async function fixTargetSchoolId(niks: string[], schoolId: number) {
  console.log(`\n=== Fix Target School ID ===`)
  console.log(`NIKs      : ${niks.join(", ")}`)
  console.log(`School ID : ${schoolId}`)

  console.log(`\nVerifying school:`)
  await verifySchool(schoolId)

  let success = 0
  let failed = 0

  for (const nik of niks) {
    console.log(`\n--- NIK: ${nik}`)
    try {
      await fixOne(nik.trim(), schoolId)
      success++
    } catch (err) {
      console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log(`\n=== Summary: ${success} updated, ${failed} failed ===`)
}
