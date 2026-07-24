import { Context } from "hono"
import momentTZ from "moment-timezone"
import { BadRequestError } from "@smile/lib/error.js"
import { BmhpApprovalProcurementRecapitulationRepository } from "./bmhp-approval-procurement-recapitulation.repository.js"
import {
  GetProcurementRecapitulationQuery,
  UpdateRemainingStockBody,
  UpdateDeskResultBody,
  CreateDeskResultBody,
} from "./bmhp-approval-procurement-recapitulation.schema.js"
import { buildProcurementRecapExcel } from "./bmhp-approval-procurement-recapitulation.excel.js"
import { generateDeskResultBAPDF } from "./bmhp-approval-procurement-recapitulation.pdf.js"

export class BmhpApprovalProcurementRecapitulationModule {
  constructor(
    private readonly repository: BmhpApprovalProcurementRecapitulationRepository
  ) {}

  /**
   * GET /bmhp-approval/procurement-recapitulation
   * Returns procurement recapitulation list for each material/variant
   * in the given program plan for the logged-in regency entity.
   */
  async list(c: Context, query: GetProcurementRecapitulationQuery) {
    const {
      program_plan_id: programPlanId,
      keyword,
      page,
      paginate,
      regency_id,
      remaining_stock_date,
    } = query
    const entityId = Number(regency_id ?? (c.var as any).userEntity?.global_id)
    if (!entityId) {
      throw new BadRequestError(
        c.var.t(
          "bmhp-approval-procurement-recapitulation.message.entity-not-found"
        )
      )
    }

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      entityId,
      programPlanId
    )

    const regencyId =
      regency_id ?? (Number((c.var as any).userEntity?.regency_id) || null)

    const isPaginated = page !== undefined && paginate !== undefined
    if (!isPaginated) {
      const raw = await this.repository.findAll(c, {
        programPlanId,
        approvalPeriodId,
        keyword,
        entityId,
        regencyId,
        remainingStockDate: remaining_stock_date ?? null,
      })
      return { data: this.formatRows(c, raw, remaining_stock_date ?? null) }
    }

    const [totalItem, raw] = await Promise.all([
      this.repository.countAll(c, { programPlanId, keyword }),
      this.repository.findAll(c, {
        programPlanId,
        approvalPeriodId,
        keyword,
        entityId,
        regencyId,
        page,
        itemPerPage: paginate,
        remainingStockDate: remaining_stock_date ?? null,
      }),
    ])

    const totalPage = paginate > 0 ? Math.ceil(totalItem / paginate) : 0

    return {
      page,
      item_per_page: paginate,
      total_item: totalItem,
      total_page: totalPage,
      list_pagination: [10, 25, 50, 100],
      data: this.formatRows(c, raw, remaining_stock_date ?? null),
    }
  }

  /**
   * POST /bmhp-approval/procurement-recapitulation
   * Update remaining_stock (stock_on_hand) for each material.
   * Recalculates procurement_proposal = MAX(0, total_needed - stock_on_hand).
   * Requires user to have a TTD (signature) in bmhp_approval_signatures.
   */
  async updateRemainingStock(c: Context, body: UpdateRemainingStockBody) {
    const { program_plan_id: programPlanId, items } = body
    const entityId = Number((c.var as any).userEntity?.global_id)
    if (!entityId) {
      throw new BadRequestError(
        c.var.t(
          "bmhp-approval-procurement-recapitulation.message.entity-not-found"
        )
      )
    }

    // Validate TTD (signature) before saving
    const userGlobalId = c.var.userId ?? 0
    const hasSignature = await this.repository.checkUserHasSignature(
      c,
      userGlobalId
    )

    if (!hasSignature) {
      return {
        status: false,
        message:
          c.var.t(
            "bmhp-approval-procurement-recapitulation.message.signature-not-found"
          ) ??
          "Tanda tangan (TTD) belum tersedia. Pastikan Anda sudah menginput tanda tangan sebelum menyimpan data stok.",
        updated_count: 0,
      }
    }

    const program_plan_id = programPlanId

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      entityId,
      program_plan_id
    )

    // Get total_needs for all submitted material_ids
    const materialIds = items.map((i) => i.material_id)
    const totalNeedsMap = await this.repository.getTotalNeedsMap(
      c,
      program_plan_id,
      entityId,
      materialIds
    )

    // Upsert each item — gunakan variant_id jika item adalah variant
    await Promise.all(
      items.map((item) => {
        // Pilih total_needs: jika item punya variant_id, gunakan key v_{variant_id};
        // jika material biasa, gunakan key m_{material_id}
        const totalNeeded = item.variant_id
          ? (totalNeedsMap.get(`v_${item.variant_id}`) ?? 0)
          : (totalNeedsMap.get(`m_${item.material_id}`) ?? 0)

        return this.repository.upsertStockRecap(c, {
          approvalPeriodId,
          materialId: item.material_id,
          variantId: item.variant_id ?? null,
          stockOnHand: item.remaining_stock,
          totalNeeded,
        })
      })
    )

    return {
      status: true,
      message: c.var.t(
        "bmhp-approval-procurement-recapitulation.message.remaining-stock-updated"
      ),
      updated_count: items.length,
    }
  }

  /**
   * POST /bmhp-approval/procurement-recapitulation/desk-result
   * Update desk_result for each material.
   */
  async updateDeskResult(c: Context, body: UpdateDeskResultBody) {
    const { program_plan_id: programPlanId, entity_id, items } = body

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      entity_id,
      programPlanId
    )

    await Promise.all(
      items.map((item) =>
        this.repository.upsertDeskResult(c, {
          approvalPeriodId,
          materialId: item.material_id,
          variantId: item.variant_id ?? null,
          deskResult: item.desk_result,
        })
      )
    )

    return {
      status: true,
      message: c.var.t(
        "bmhp-approval-procurement-recapitulation.message.desk-result-updated"
      ),
      updated_count: items.length,
    }
  }

  /**
   * GET /bmhp-approval/procurement-recapitulation/xls
   * Export procurement recapitulation as Excel file.
   */
  async exportExcel(c: Context, query: GetProcurementRecapitulationQuery) {
    const { program_plan_id: programPlanId, regency_id } = query
    // Priority: regency_id from query params > logged-in user's entity (global_id → entities.id)
    const entityId = Number(regency_id ?? (c.var as any).userEntity?.global_id)
    if (!entityId) {
      throw new BadRequestError(
        c.var.t(
          "bmhp-approval-procurement-recapitulation.message.entity-not-found"
        )
      )
    }

    const program_plan_id = programPlanId

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      entityId,
      program_plan_id
    )

    const raw = await this.repository.findAll(c, {
      programPlanId,
      approvalPeriodId,
      keyword: query.keyword,
      entityId,
      regencyId:
        regency_id ?? (Number((c.var as any).userEntity?.regency_id) || null),
      page: 1,
      itemPerPage: Number.MAX_SAFE_INTEGER,
      remainingStockDate: query.remaining_stock_date ?? null,
    })

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `ProcurementRecapitulation_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    return buildProcurementRecapExcel(
      c,
      this.formatRows(c, raw, query.remaining_stock_date ?? null),
      filename
    )
  }

  private formatRows(
    c: Context,
    raw: {
      rows: any[]
      wsStockTotalQtyMap: Map<string | number, number>
      totalNeedsMap: Map<string, number>
    },
    remainingStockDate?: string | null
  ) {
    const { rows, wsStockTotalQtyMap, totalNeedsMap } = raw

    return rows.map((row: any) => {
      let totalNeeds = 0
      let procurementProposal = 0
      let proposalBuffer = 0

      const materialId = Number(row.material_id)
      const physicalMaterialId = row.physical_material_id
        ? Number(row.physical_material_id)
        : materialId
      let remainingStock = 0

      if (row.stock_on_hand != null) {
        remainingStock = Number(row.stock_on_hand)
      } else if (Number(row.is_variant) === 0) {
        remainingStock =
          wsStockTotalQtyMap.get(row.name) ??
          wsStockTotalQtyMap.get(physicalMaterialId) ??
          0
      } else {
        remainingStock = wsStockTotalQtyMap.get(materialId) ?? 0
      }

      if (!remainingStockDate) {
        // If remainingStockDate is empty, use data from ws_bmhp_stock_recaps
        totalNeeds = Number(row.total_needed || 0)
        procurementProposal = Number(row.procurement_proposal || 0)
        proposalBuffer = Number(row.buffer_qty || 0)
      } else {
        // Calculate dynamically
        totalNeeds =
          Number(row.is_variant) === 0 && row.variant_id
            ? (totalNeedsMap.get(`d_${row.variant_id}`) ??
              totalNeedsMap.get(`t_${row.id}`) ??
              0)
            : (totalNeedsMap.get(`t_${row.id}`) ?? 0)

        procurementProposal = Math.max(0, totalNeeds - remainingStock)
        const bufferPct = Number(row.buffer_percentage)
        proposalBuffer = Math.ceil(
          Math.round(procurementProposal * (1 + bufferPct / 100) * 1e10) / 1e10
        )
      }

      return {
        id: Number(row.id),
        material_id: materialId,
        variant_id:
          Number(row.is_variant) === 0 ? Number(row.variant_id) || null : null,
        name: row.name ?? "",
        unit: c.var.t(`material_unit.label.${row.unit || "-"}`),
        total_needs: totalNeeds,
        remaining_stock: remainingStock,
        procurement_proposal: procurementProposal,
        proposal_buffer: proposalBuffer,
        // desk_result: Number(row.desk_result ?? 0),
      }
    })
  }

  /**
   * POST /bmhp-approval/procurement-recapitulation/desk-result-record
   * Create desk result record in ws_bmhp_desk_results
   */
  async createDeskResultRecord(c: Context, body: CreateDeskResultBody) {
    const {
      program_plan_id,
      entity_id,
      status_desk,
      ba_file_url,
      signature_link,
      desk_date,
      desk_by,
    } = body

    const approvalPeriodId = await this.repository.getOrCreateApprovalPeriod(
      c,
      entity_id,
      program_plan_id
    )

    const result = await this.repository.createDeskResult(c, {
      approvalPeriodId,
      entityId: entity_id,
      statusDesk: status_desk,
      baFileUrl: ba_file_url,
      signatureLink: signature_link,
      deskDate: desk_date,
      deskBy: desk_by,
    })

    return {
      status: true,
      message: c.var.t(
        "bmhp-approval-procurement-recapitulation.message.desk-result-record-created"
      ),
      data: result,
    }
  }

  /**
   * GET /bmhp-approval/procurement-recapitulation/ba-pdf
   * Generate Berita Acara (BA) PDF for desk result
   */
  async generateDeskResultBAPDF(
    c: Context,
    programPlanId: number,
    entityId: number
  ) {
    const data = await this.repository.getDeskResultBAData(c, {
      programPlanId,
      entityId,
    })

    if (!data) {
      throw new BadRequestError(
        c.var.t(
          "bmhp-approval-procurement-recapitulation.message.data-not-found"
        )
      )
    }

    const pdfBuffer = await generateDeskResultBAPDF(data)

    const filename = `BA_Hasil_Desk_${data.regency_name.replace(/\s+/g, "_")}_${momentTZ().format("YYYYMMDD_HHmmss")}.pdf`

    return {
      filename,
      buffer: pdfBuffer,
    }
  }
}
