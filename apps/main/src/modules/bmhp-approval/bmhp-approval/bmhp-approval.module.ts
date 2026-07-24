import { Context } from "hono"
import { BmhpApprovalRepository } from "./bmhp-approval.repository.js"
import {
  GetApprovalListQuery,
  ReviewProgramPlanBody,
  GetApprovalDetailParam,
  GetProvinceApprovalListQuery,
  UpdateProvinceApprovalBody,
  SubmitProvinceApprovalBody,
  GetEntityQuery,
  UpsertSignatureBody,
} from "./bmhp-approval.schema.js"
import { buildProvinceApprovalExcel } from "./bmhp-approval-province.excel.js"
import momentTZ from "moment-timezone"
import { BmhpApprovalMonitoringModule } from "../bmhp-approval-monitoring/bmhp-approval-monitoring.module.js"
import { BmhpTargetAdjustmentModule } from "../target-and-adjusment/bmhp-target-and-adjusment.module.js"
import { BmhpApprovalMaterialNeedsModule } from "../bmhp-approval-material-needs/bmhp-approval-material-needs.module.js"
import { BmhpApprovalProcurementRecapitulationModule } from "../bmhp-approval-procurement-recapitulation/bmhp-approval-procurement-recapitulation.module.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"

export class BmhpApprovalModule {
  constructor(
    public monitoringRepository: BmhpApprovalRepository,
    private readonly monitoringModule: BmhpApprovalMonitoringModule,
    private readonly targetAdjustmentModule: BmhpTargetAdjustmentModule,
    private readonly materialNeedsModule: BmhpApprovalMaterialNeedsModule,
    private readonly procurementRecapModule: BmhpApprovalProcurementRecapitulationModule
  ) {}

  async listApproval(c: Context, query: GetApprovalListQuery) {
    const { programId } = c.var
    const { list, total } =
      await this.monitoringRepository.findApprovalProgramPlanList(
        c,
        query,
        programId
      )

    const paginate = query.paginate ?? 10
    const totalPage = paginate > 0 ? Math.ceil(total / paginate) : 0

    return {
      page: query.page ?? 1,
      item_per_page: paginate,
      total_item: total,
      total_page: totalPage,
      list_pagination: [10, 25, 50, 100],
      data: list,
    }
  }

  /**
   * GET /bmhp-approval/:year
   * Return details of a program plan by year for the current program.
   */
  async getDetail(c: Context, params: GetApprovalDetailParam) {
    const { programId } = c.var
    const data = await this.monitoringRepository.findApprovalProgramPlanById(
      c,
      params.program_plan_id,
      programId
    )
    if (!data) {
      return {
        status: false,
        message: c.var.t("bmhp-approval.message.program-plan-not-found"),
        data: null,
      }
    }
    return { status: true, message: c.var.t("bmhp-approval.message.ok"), data }
  }

  /**
   * POST /bmhp-approval/review
   * Set ws_program_plans.approval_status = REVISION (2) and persist notes.
   * Also marks all linked ws_bmhp_planning records as REVISION.
   */
  async reviewProgramPlan(c: Context, body: ReviewProgramPlanBody) {
    const result = await this.monitoringRepository.reviewProgramPlan(
      c,
      body.program_plan_id,
      body.notes
    )
    return {
      status: true,
      message: c.var.t("bmhp-approval.message.program-plan-updated"),
      data: result,
    }
  }

  /**
   * GET /bmhp-approval-province
   */
  async listProvinceApproval(c: Context, query: GetProvinceApprovalListQuery) {
    const province_id = c.var.userEntity.province_id
    const { list, total, meta } =
      await this.monitoringRepository.findProvinceApprovalList(
        c,
        query,
        province_id ?? ""
      )

    const paginate = query.paginate ?? 10
    const totalPage = paginate > 0 ? Math.ceil(total / paginate) : 0

    return {
      page: query.page ?? 1,
      item_per_page: paginate,
      total_item: total,
      total_page: totalPage,
      list_pagination: [10, 25, 50, 100],
      data: list,
      meta,
    }
  }

  /**
   * GET /bmhp-approval-province/xls
   */
  async exportProvinceApprovalXls(
    c: Context,
    query: GetProvinceApprovalListQuery
  ) {
    const { province_id } = (c.var as any).userEntity
    const { list } = await this.monitoringRepository.findProvinceApprovalList(
      c,
      { ...query, page: 1, paginate: Number.MAX_SAFE_INTEGER },
      province_id
    )

    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `ProvinceBMHPApproval_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    return buildProvinceApprovalExcel(c, list, filename)
  }

  /**
   * GET /province/xls/:regency_id
   * Export regency approval details as Excel with 4 workspaces.
   */
  async exportRegencyDetailXls(
    c: Context,
    entityId: number,
    programPlanId: number
  ) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `RegencyBMHPApproval_${entityId}_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    // All 4 sub-modules receive regency_id=entityId — same convention as the
    // standalone monitoring XLS endpoint (/monitoring/xls?regency_id=97).
    // Each sub-module internally resolves entity → location regency_id.

    // 1. Worksheet 1: Monitoring
    // findRows returns raw rows — must be processed via groupByPuskesmas
    // to produce { puskesmas_name, screenings, progress } shape for Excel builder
    const monitoringResult = await (
      this.monitoringModule as any
    ).repository.findRows(c, {
      program_plan_id: programPlanId,
      regency_id: entityId,
      paginate: 999999,
      page: 1,
    })
    const monitoringData = {
      list: (this.monitoringModule as any).groupByPuskesmas(
        monitoringResult.rows,
        monitoringResult.examinations
      ),
      examinations: monitoringResult.examinations,
    }

    // 2. Worksheet 2: Target & Adjustment
    // Use regency_id=entityId (not entity_id) so filtering matches other sub-modules
    const targetAdjustmentData =
      await this.targetAdjustmentModule.getVerifyPlanning(c, {
        program_plan_id: programPlanId,
        regency_id: entityId,
      } as any)

    // 3. Worksheet 3: Material Needs
    // Resolve entity → location regency_id for the repository filter
    let materialRegencyId = (c.var as any).userEntity?.regency_id
    const resolvedRegencyId =
      await this.monitoringRepository.findRegencyIdByEntityId(c, entityId)
    if (resolvedRegencyId) {
      materialRegencyId = resolvedRegencyId
    }
    const materialRawRows = await (
      this.materialNeedsModule as any
    ).repository.findAllForExcel(
      c,
      { program_plan_id: programPlanId },
      materialRegencyId
    )
    // Localize unit labels BEFORE aggregation (same as material needs exportExcel)
    const materialNeedsData = (
      this.materialNeedsModule as any
    ).aggregateByPuskesmas(
      materialRawRows.map((row: any) => ({
        ...row,
        unit: c.var.t(`material_unit.label.${row.unit}`),
      }))
    )

    // 4. Worksheet 4: Procurement Recapitulation
    // regency_id here is entity_id of the dinkes kabupaten
    const procurementRecapData = await (
      this.procurementRecapModule as any
    ).list(c, {
      program_plan_id: programPlanId,
      regency_id: entityId,
    })

    return buildProvinceApprovalExcel(
      c,
      [],
      filename,
      {
        monitoring: monitoringData,
        targetAdjustment: targetAdjustmentData,
        materialNeeds: materialNeedsData,
        procurementRecap: procurementRecapData.data,
      }
    )
  }

  /**
   * POST /province/:entity_id
   */
  async updateProvinceApproval(
    c: Context,
    entityId: number,
    body: UpdateProvinceApprovalBody
  ) {
    const result = await this.monitoringRepository.updateProvinceApprovalStatus(
      c,
      body.program_plan_id,
      body.status,
      entityId
    )
    return {
      status: true,
      message: c.var.t("bmhp-approval.message.program-plan-updated"),
      data: result,
    }
  }

  /**
   * POST /province-submit
   */
  async submitProvince(c: Context, body: SubmitProvinceApprovalBody) {
    const userProvinceId = String((c.var as any).userEntity?.province_id)
    const entityId = (c.var as any).userEntity?.global_id

    const result = await this.monitoringRepository.submitProvinceApproval(
      c,
      body.program_plan_id,
      userProvinceId,
      entityId
    )

    return {
      status: true,
      message: "Berhasil disubmit ke Kementerian Kesehatan",
      data: result,
    }
  }

  /**
   * GET /province/get-regency/:id
   * Returns entity data with regency/province info by entity_id
   */
  async getEntityWithRegency(c: Context, entityId: number) {
    const result = await this.monitoringRepository.getEntityWithRegency(
      c,
      entityId
    )

    return {
      status: true,
      data: result,
    }
  }

  async listEntity(c: Context, query: GetEntityQuery) {
    const page = query.page ?? 1
    const paginate = query.paginate ?? 10
    const { list, total } = await this.monitoringRepository.getPuskesmasByParentEntity(
      c,
      {
        page,
        paginate,
        keyword: query.keyword,
        entity_regency_id: query.entity_regency_id,
      }
    )
    return new PaginatedResponse({ page, paginate }, list, total)
  }

  /**
   * GET /bmhp-approval-signature
   * Get signature data for the logged in user
   */
  async getSignature(c: Context) {
    const userId = Number(c.var.userId)

    if (!userId) {
      return {
        status: false,
        message: "User ID not found in context",
        data: null,
      }
    }

    const signature = await this.monitoringRepository.getSignature(c, userId)

    return {
      status: true,
      message: signature ? "Signature found" : "Signature not found",
      data: signature,
    }
  }

  /**
   * POST /bmhp-approval-signature
   * Upsert signature data for the logged in user
   */
  async upsertSignature(c: Context, body: UpsertSignatureBody) {
    const userId = Number(c.var.userId)

    if (!userId) {
      return {
        status: false,
        message: "User ID not found in context",
      }
    }

    await this.monitoringRepository.upsertSignature(c, userId, body)

    return {
      status: true,
      message: "Signature saved successfully",
    }
  }
}
