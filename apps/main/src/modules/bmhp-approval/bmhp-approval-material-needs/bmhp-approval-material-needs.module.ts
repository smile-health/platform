import { Context } from "hono"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import momentTZ from "moment-timezone"
import { BmhpApprovalMaterialNeedsRepository } from "./bmhp-approval-material-needs.repository.js"
import {
  CalculateMaterialNeedsBody,
  GetMaterialNeedsQuery,
} from "./bmhp-approval-material-needs.schema.js"
import { buildMaterialNeedsExcel } from "./bmhp-approval-material-needs.excel.js"

type MaterialItem = {
  wpm_id: number
  material_id: number
  material_name: string
  material_variant: string
  unit: string
  type: string
  total_needed: number
}

type ScreeningEntry = {
  material_id: number
  material_name: string
  materials: MaterialItem[]
  summary: {
    total_materials: number
    total_items: number
  }
}

type PuskesmasEntry = {
  puskesmas_id: number
  puskesmas_name: string
  sub_district_name: string
  screenings: ScreeningEntry[]
}

export class BmhpApprovalMaterialNeedsModule {
  constructor(
    private readonly repository: BmhpApprovalMaterialNeedsRepository
  ) {}

  async list(c: Context, query: GetMaterialNeedsQuery) {
    let userRegencyId = (c.var as any).userEntity?.regency_id
    if (query.regency_id) {
      userRegencyId = await this.repository.findRegencyIdByEntityId(
        c,
        query.regency_id
      )
    }

    const rawData = await this.repository.findMaterialNeeds(
      c,
      query,
      userRegencyId
    )
    const localizedData = rawData.map((row) => ({
      ...row,
      unit: c.var.t(`material_unit.label.${row.unit}`),
    }))
    const allData = this.aggregateByPuskesmas(localizedData)

    const paginate = query.paginate ?? 10
    const page = query.page ?? 1
    const offset = (page - 1) * paginate
    const pageData = allData.slice(offset, offset + paginate)

    return new PaginatedResponse({ paginate, page }, pageData, allData.length)
  }

  aggregateByPuskesmas(rows: any[]): PuskesmasEntry[] {
    const puskesmasMap = new Map<
      number,
      {
        entry: PuskesmasEntry
        screeningMap: Map<
          string,  // ← keyed by bm_material_name, not ws_material_id
          ScreeningEntry & { materialItemMap: Map<string, MaterialItem> }
        >
      }
    >()

    for (const row of rows) {
      const puskesmasId = Number(row.puskesmas_id)
      const totalNeeded = Number(row.total_needed ?? 0)

      if (!puskesmasMap.has(puskesmasId)) {
        puskesmasMap.set(puskesmasId, {
          entry: {
            puskesmas_id: puskesmasId,
            puskesmas_name: row.puskesmas_name ?? "",
            sub_district_name: row.sub_district_name ?? "",
            screenings: [],
          },
          screeningMap: new Map(),
        })
      }

      const puskesmas = puskesmasMap.get(puskesmasId)!

      // Group screenings by bm_material_name so the same material name is never duplicated
      const bmMaterialName = row.bm_material_name ?? ""

      if (!puskesmas.screeningMap.has(bmMaterialName)) {
        const screening = {
          material_id: Number(row.ws_material_id),
          material_name: bmMaterialName,
          materials: [] as MaterialItem[],
          summary: { total_materials: 0, total_items: 0 },
          materialItemMap: new Map<string, MaterialItem>(),
        }
        puskesmas.screeningMap.set(bmMaterialName, screening)
        puskesmas.entry.screenings.push(screening)
      }

      const screening = puskesmas.screeningMap.get(bmMaterialName)!

      // Deduplicate material items by material_id + material_variant, sum total_needed
      const itemKey = `${row.material_id}__${row.material_variant ?? ""}`
      if (screening.materialItemMap.has(itemKey)) {
        screening.materialItemMap.get(itemKey)!.total_needed += totalNeeded
        screening.summary.total_items += totalNeeded
      } else {
        const item: MaterialItem = {
          wpm_id: Number(row.wpm_id),
          material_id: Number(row.material_id),
          material_name: row.material_name ?? "",
          material_variant: row.material_variant ?? "",
          unit: row.unit ?? "",
          type: row.type ?? "",
          total_needed: totalNeeded,
        }
        screening.materialItemMap.set(itemKey, item)
        screening.materials.push(item)
        screening.summary.total_materials += 1
        screening.summary.total_items += totalNeeded
      }
    }

    return Array.from(puskesmasMap.values()).map((p) => ({
      ...p.entry,
      screenings: p.entry.screenings.map(({ ...s }) => {
        const { materialItemMap, ...rest } = s as any
        return rest
      }),
    }))
  }

  async exportExcel(c: Context, query: GetMaterialNeedsQuery) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalMaterialNeeds_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`
    let userRegencyId = (c.var as any).userEntity?.regency_id
    if (query.regency_id) {
      userRegencyId = await this.repository.findRegencyIdByEntityId(
        c,
        query.regency_id
      )
    }

    const rows = await this.repository.findAllForExcel(
      c,
      {
        program_plan_id: query.program_plan_id,
        entity_id: query.entity_id,
        examination_id: query.examination_id,
        material_id: query.material_id,
      },
      userRegencyId
    )

    // Reuse the same aggregation used by the list endpoint
    const localizedRows = rows.map((row) => ({
      ...row,
      unit: c.var.t(`material_unit.label.${row.unit}`),
    }))
    const aggregated = this.aggregateByPuskesmas(localizedRows)
    return buildMaterialNeedsExcel(c, aggregated, filename)
  }

  async calculate(c: Context, body: CalculateMaterialNeedsBody) {
    const calculatedItems = await this.repository.calculateMaterialNeeds(
      c,
      body.approval_period_id
    )
    return {
      success: true,
      message: c.var.t(
        "bmhp-approval-material-needs.message.calculate-success"
      ),
      data: {
        calculated_items: calculatedItems,
      },
    }
  }
}
