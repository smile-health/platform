import { db } from "@/common/infrastructure/database/index.js"

/**
 * Script to move ws_targets and ws_microplan_absolute_target
 * from one microplanning year to another.
 *
 * Scenario: Each entity has 2 microplanning records (e.g. 2026 and 2027).
 * Data was incorrectly saved under 2027, needs to be moved to 2026.
 *
 * Steps:
 * 1. Find all ws_microplanning with year=fromYear
 * 2. For each, find the matching ws_microplanning with year=toYear (same entity_id)
 * 3. Update ws_targets.microplanning_id → toYear mp id
 * 4. Update ws_microplan_absolute_target.microplan_id → toYear mp id
 */
export async function changeMicroplanningYear(
  fromYear: number,
  toYear: number,
  dryRun = false
) {
  console.log(
    `\n=== Move Microplanning Data: year ${fromYear} → ${toYear} ===`
  )
  console.log(`Mode: ${dryRun ? "DRY RUN (no changes)" : "LIVE"}`)

  // Step 1: Get all microplanning records for fromYear
  const mpFrom = await db
    .selectFrom("ws_microplanning")
    .select(["id", "entity_id", "year", "status"])
    .where("year", "=", fromYear)
    .where("deleted_at", "is", null)
    .execute()

  console.log(`\nFound ${mpFrom.length} microplanning(s) with year=${fromYear}`)

  if (mpFrom.length === 0) {
    console.log("Nothing to do. Exiting.")
    return
  }

  // Step 2: Get all microplanning records for toYear, mapped by entity_id
  const mpTo = await db
    .selectFrom("ws_microplanning")
    .select(["id", "entity_id"])
    .where("year", "=", toYear)
    .where("deleted_at", "is", null)
    .execute()

  const toMap = new Map(mpTo.map((r) => [r.entity_id, r.id]))

  console.log(`Found ${mpTo.length} microplanning(s) with year=${toYear}`)

  // Check which entities don't have a toYear microplanning
  const noMatch = mpFrom.filter((mp) => !toMap.has(mp.entity_id))
  if (noMatch.length > 0) {
    console.log(
      `\n⚠️  ${noMatch.length} entity(ies) have NO microplanning for year=${toYear} — will be SKIPPED:`
    )
    for (const m of noMatch.slice(0, 10)) {
      console.log(`  entity_id=${m.entity_id}, mp_id=${m.id}`)
    }
    if (noMatch.length > 10) console.log(`  ... and ${noMatch.length - 10} more`)
  }

  const toProcess = mpFrom.filter((mp) => toMap.has(mp.entity_id))
  console.log(`\nWill process ${toProcess.length} entity(ies)\n`)

  let successCount = 0
  let failedCount = 0
  let totalTargets = 0
  let totalAbsTargets = 0

  for (const oldMp of toProcess) {
    const newMpId = toMap.get(oldMp.entity_id)!

    console.log(
      `--- entity_id=${oldMp.entity_id}: mp_id ${oldMp.id} (${fromYear}) → ${newMpId} (${toYear})`
    )

    try {
      // Count affected rows
      const targetResult = await db
        .selectFrom("ws_targets")
        .select(db.fn.count("id").as("count"))
        .where("microplanning_id", "=", oldMp.id)
        .where("deleted_at", "is", null)
        .executeTakeFirst()
      const targetCount = Number(targetResult?.count ?? 0)

      const absTargetResult = await db
        .selectFrom("ws_microplan_absolute_target")
        .select(db.fn.count("id").as("count"))
        .where("microplan_id", "=", oldMp.id)
        .where("deleted_at", "is", null)
        .executeTakeFirst()
      const absTargetCount = Number(absTargetResult?.count ?? 0)

      console.log(`  ws_targets                     : ${targetCount} row(s)`)
      console.log(`  ws_microplan_absolute_target   : ${absTargetCount} row(s)`)

      if (targetCount === 0 && absTargetCount === 0) {
        console.log(`  ⏭️  No data to move — skipping`)
        successCount++
        continue
      }

      if (dryRun) {
        console.log(`  ⏭️  DRY RUN — skipping actual update`)
        totalTargets += targetCount
        totalAbsTargets += absTargetCount
        successCount++
        continue
      }

      // Execute in transaction
      await db.transaction().execute(async (trx) => {
        if (targetCount > 0) {
          await trx
            .updateTable("ws_targets")
            .set({
              microplanning_id: newMpId,
              updated_at: new Date(),
            })
            .where("microplanning_id", "=", oldMp.id)
            .where("deleted_at", "is", null)
            .execute()

          console.log(
            `  ✅ ws_targets: ${targetCount} row(s) → microplanning_id=${newMpId}`
          )
        }

        if (absTargetCount > 0) {
          await trx
            .updateTable("ws_microplan_absolute_target")
            .set({
              microplan_id: newMpId,
              updated_at: new Date(),
            })
            .where("microplan_id", "=", oldMp.id)
            .where("deleted_at", "is", null)
            .execute()

          console.log(
            `  ✅ ws_microplan_absolute_target: ${absTargetCount} row(s) → microplan_id=${newMpId}`
          )
        }
      })

      totalTargets += targetCount
      totalAbsTargets += absTargetCount
      successCount++
    } catch (err) {
      console.error(
        `  ❌ ERROR: ${err instanceof Error ? err.message : String(err)}`
      )
      failedCount++
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Entities processed : ${successCount}`)
  console.log(`Entities failed    : ${failedCount}`)
  console.log(`Entities skipped   : ${noMatch.length} (no ${toYear} microplanning)`)
  console.log(`ws_targets moved           : ${totalTargets}`)
  console.log(`ws_microplan_abs moved     : ${totalAbsTargets}`)
}
