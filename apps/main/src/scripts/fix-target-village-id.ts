import { db } from "@/common/infrastructure/database/index.js"
import { doEncrypt } from "@/modules/transaction/utils/transaction.encryption.js"
import { sql } from "kysely"

interface LocationRow {
  id: number
  parent_id: number | null
  level: number | null
  name: string
}

async function getLocationHierarchy(villageId: number): Promise<{
  village_id: number
  subdistrict_id: number
  regency_id: number
  province_id: number
}> {
  const village = await db
    .selectFrom("locations")
    .select(["id", "parent_id", "level", "name"])
    .where("id", "=", villageId)
    .executeTakeFirst() as LocationRow | undefined

  if (!village) throw new Error(`Village ID ${villageId} not found in locations table`)

  const subdistrict = await db
    .selectFrom("locations")
    .select(["id", "parent_id", "level", "name"])
    .where("id", "=", village.parent_id!)
    .executeTakeFirst() as LocationRow | undefined

  if (!subdistrict) throw new Error(`Subdistrict (parent of village ${villageId}) not found`)

  const regency = await db
    .selectFrom("locations")
    .select(["id", "parent_id", "level", "name"])
    .where("id", "=", subdistrict.parent_id!)
    .executeTakeFirst() as LocationRow | undefined

  if (!regency) throw new Error(`Regency (parent of subdistrict ${subdistrict.id}) not found`)

  const province = await db
    .selectFrom("locations")
    .select(["id", "parent_id", "level", "name"])
    .where("id", "=", regency.parent_id!)
    .executeTakeFirst() as LocationRow | undefined

  if (!province) throw new Error(`Province (parent of regency ${regency.id}) not found`)

  console.log(`  Village     : ${village.id} - ${village.name}`)
  console.log(`  Subdistrict : ${subdistrict.id} - ${subdistrict.name}`)
  console.log(`  Regency     : ${regency.id} - ${regency.name}`)
  console.log(`  Province    : ${province.id} - ${province.name}`)

  return {
    village_id: village.id,
    subdistrict_id: subdistrict.id,
    regency_id: regency.id,
    province_id: province.id,
  }
}

type LocationHierarchy = Awaited<ReturnType<typeof getLocationHierarchy>>

async function fixOne(
  nik: string,
  registeredLocation?: LocationHierarchy,
  residenceLocation?: LocationHierarchy
) {
  const encryptedNik = doEncrypt(nik)

  const target = await db
    .selectFrom("ws_targets")
    .selectAll()
    .where("nik", "=", encryptedNik)
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!target) {
    console.error(`  ERROR: No active target found for NIK ${nik}`)
    return
  }

  console.log(`  Found target ID: ${target.id}`)
  console.log(`  Registered: province=${target.registered_province_id}, regency=${target.registered_regency_id}, subdistrict=${target.registered_subdistrict_id}, village=${target.registered_village_id}`)
  console.log(`  Residence : province=${target.residence_province_id}, regency=${target.residence_regency_id}, subdistrict=${target.residence_subdistrict_id}, village=${target.residence_village_id}`)

  const updatePayload: Record<string, number | Date> = { updated_at: new Date() }

  if (registeredLocation) {
    updatePayload.registered_province_id = registeredLocation.province_id
    updatePayload.registered_regency_id = registeredLocation.regency_id
    updatePayload.registered_subdistrict_id = registeredLocation.subdistrict_id
    updatePayload.registered_village_id = registeredLocation.village_id
  }

  if (residenceLocation) {
    updatePayload.residence_province_id = residenceLocation.province_id
    updatePayload.residence_regency_id = residenceLocation.regency_id
    updatePayload.residence_subdistrict_id = residenceLocation.subdistrict_id
    updatePayload.residence_village_id = residenceLocation.village_id
  } else if (registeredLocation) {
    // auto-detect: jika registered == residence sebelumnya, ikut update residence
    const registeredSameAsResidence =
      target.registered_province_id === target.residence_province_id &&
      target.registered_regency_id === target.residence_regency_id &&
      target.registered_subdistrict_id === target.residence_subdistrict_id &&
      target.registered_village_id === target.residence_village_id

    if (registeredSameAsResidence) {
      updatePayload.residence_province_id = registeredLocation.province_id
      updatePayload.residence_regency_id = registeredLocation.regency_id
      updatePayload.residence_subdistrict_id = registeredLocation.subdistrict_id
      updatePayload.residence_village_id = registeredLocation.village_id
      console.log(`  Strategy: update BOTH registered and residence (were identical)`)
    } else {
      console.log(`  Strategy: update ONLY registered (residence differs)`)
    }
  }

  if (registeredLocation && residenceLocation) {
    console.log(`  Strategy: update registered + residence (explicit)`)
  } else if (!registeredLocation && residenceLocation) {
    console.log(`  Strategy: update ONLY residence`)
  }

  await db
    .updateTable("ws_targets")
    .set(updatePayload)
    .where("id", "=", target.id)
    .execute()

  console.log(`  ✅ Updated target ID ${target.id}`)
}

export async function fixTargetVillageId(
  niks: string[],
  villageId?: number,
  residenceVillageId?: number
) {
  if (!villageId && !residenceVillageId) {
    throw new Error("At least one of --villageId or --residenceVillageId must be provided")
  }

  console.log(`\n=== Fix Target Village ID ===`)
  console.log(`NIKs                  : ${niks.join(", ")}`)
  if (villageId) console.log(`Registered Village ID : ${villageId}`)
  if (residenceVillageId) console.log(`Residence Village ID  : ${residenceVillageId}`)

  let registeredLocation: LocationHierarchy | undefined
  if (villageId) {
    console.log(`\nResolving registered location hierarchy:`)
    registeredLocation = await getLocationHierarchy(villageId)
  }

  let residenceLocation: LocationHierarchy | undefined
  if (residenceVillageId) {
    console.log(`\nResolving residence location hierarchy:`)
    residenceLocation = await getLocationHierarchy(residenceVillageId)
  }

  let success = 0
  let failed = 0

  for (const nik of niks) {
    console.log(`\n--- NIK: ${nik}`)
    try {
      await fixOne(nik.trim(), registeredLocation, residenceLocation)
      success++
    } catch (err) {
      console.error(`  ERROR: ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log(`\n=== Summary: ${success} updated, ${failed} failed ===`)
}
