import type { Kysely } from "kysely"

const LIPID_BMHPS = [
  "Reagen control",
  "Reagensia Cholesterol Total",
  "Reagensia HDL Direct",
  "Reagensia LDL Direct",
  "Reagensia Trigliserida",
  "Alcohol Swab",
  "Plester bulat bening",
  "Tabung vacutainer tutup kuning",
  "Tip Kuning",
  "Vacutainer Needle",
]

const RISIKO_JANTUNG_BMHPS = ["Gel EKG", "Thermal paper EKG"]

const BMHPS_BY_EXAM: Record<string, string[]> = {
  "Profil Lipid": LIPID_BMHPS,
  "Risiko Jantung": RISIKO_JANTUNG_BMHPS,
}

export async function up(db: Kysely<any>): Promise<void> {
  // Find the target group ID for "Dewasa Usia 40 - 59 Tahun dengan HT & DM"
  const targetGroupRow: any = await db
    .selectFrom("target_groups")
    .select("id")
    .where("title", "=", "Dewasa Usia 40 - 59 Tahun dengan HT & DM")
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!targetGroupRow) {
    console.error("Target group 'Dewasa Usia 40 - 59 Tahun dengan HT & DM' not found")
    return
  }
  const targetGroupId = Number(targetGroupRow.id)

  // Find all Profil Lipid and Risiko Jantung examinations across all program plans
  const examRows: any[] = await db
    .selectFrom("bmhp_examinations")
    .select(["id", "name", "program_plan_id"])
    .where("name", "in", ["Profil Lipid", "Risiko Jantung"])
    .where("deleted_at", "is", null)
    .execute()

  console.log(`Found ${examRows.length} examinations to fix`)

  let fixedEtgCount = 0
  let fixedTmCount = 0

  for (const exam of examRows) {
    const examId = Number(exam.id)
    const planId = Number(exam.program_plan_id)
    const examName = String(exam.name)

    // Resolve or create the ws_bmhp_examination_target_groups link
    let etgId: number
    const existingLink: any = await db
      .selectFrom("ws_bmhp_examination_target_groups")
      .select("id")
      .where("examination_id", "=", examId)
      .where("target_group_id", "=", targetGroupId)
      .executeTakeFirst()

    if (existingLink) {
      etgId = Number(existingLink.id)
    } else {
      const etgResult = await db
        .insertInto("ws_bmhp_examination_target_groups")
        .values({
          examination_id: examId,
          target_group_id: targetGroupId,
        })
        .executeTakeFirst()
      etgId = Number(etgResult.insertId)
      fixedEtgCount++
      console.log(`  Added target group ${targetGroupId} to exam ${examId} (${examName}, plan ${planId})`)
    }

    // Resolve bmhp_materials for this plan, then backfill target materials
    const bmhpNames = BMHPS_BY_EXAM[examName] ?? []
    if (bmhpNames.length === 0) continue

    const bmhpMatRows: any[] = await db
      .selectFrom("bmhp_materials")
      .select(["id", "name"])
      .where("program_plan_id", "=", planId)
      .where("deleted_at", "is", null)
      .execute()
    const bmhpIdsByName = new Map<string, number[]>()
    for (const r of bmhpMatRows) {
      const key = String(r.name).toLowerCase().trim()
      if (!bmhpIdsByName.has(key)) bmhpIdsByName.set(key, [])
      bmhpIdsByName.get(key)!.push(Number(r.id))
    }

    const existingTmRows: any[] = await db
      .selectFrom("ws_bmhp_examination_target_materials")
      .select("bmhp_material_id")
      .where("exam_target_group_id", "=", etgId)
      .where("deleted_at", "is", null)
      .execute()
    const existingTmSet = new Set(existingTmRows.map((r: any) => Number(r.bmhp_material_id)))

    const tmToInsert: Array<{ exam_target_group_id: number; bmhp_material_id: number }> = []
    for (const bmhpName of bmhpNames) {
      const ids = bmhpIdsByName.get(bmhpName.toLowerCase().trim()) ?? []
      for (const bmhpId of ids) {
        if (!existingTmSet.has(bmhpId)) {
          tmToInsert.push({ exam_target_group_id: etgId, bmhp_material_id: bmhpId })
          existingTmSet.add(bmhpId)
        }
      }
    }

    if (tmToInsert.length > 0) {
      await db.insertInto("ws_bmhp_examination_target_materials").values(tmToInsert).execute()
      fixedTmCount += tmToInsert.length
      console.log(`  Added ${tmToInsert.length} target materials to etg ${etgId} (${examName}, plan ${planId})`)
    }
  }

  console.log(`Fixed ${fixedEtgCount} examination-target group links, ${fixedTmCount} target materials`)
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the links we added - only for Profil Lipid and Risiko Jantung
  const examRows: any[] = await db
    .selectFrom("bmhp_examinations")
    .select("id")
    .where("name", "in", ["Profil Lipid", "Risiko Jantung"])
    .where("deleted_at", "is", null)
    .execute()

  const examIds = examRows.map((r: any) => Number(r.id))
  if (examIds.length === 0) return

  const targetGroupRow: any = await db
    .selectFrom("target_groups")
    .select("id")
    .where("title", "=", "Dewasa Usia 40 - 59 Tahun dengan HT & DM")
    .where("deleted_at", "is", null)
    .executeTakeFirst()

  if (!targetGroupRow) return
  const targetGroupId = Number(targetGroupRow.id)

  const etgRows: any[] = await db
    .selectFrom("ws_bmhp_examination_target_groups")
    .select("id")
    .where("examination_id", "in", examIds)
    .where("target_group_id", "=", targetGroupId)
    .execute()
  const etgIds = etgRows.map((r: any) => Number(r.id))

  if (etgIds.length > 0) {
    await db
      .deleteFrom("ws_bmhp_examination_target_materials")
      .where("exam_target_group_id", "in", etgIds)
      .execute()
  }

  await db
    .deleteFrom("ws_bmhp_examination_target_groups")
    .where("examination_id", "in", examIds)
    .where("target_group_id", "=", targetGroupId)
    .execute()
}
