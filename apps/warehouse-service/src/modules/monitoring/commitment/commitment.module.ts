import { Mailer } from "@smile-health/lib/mail/mail.js"
import { Context } from "hono"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { CommitmentMonitoringExcel } from "./commitment.excel.js"
import { CommitmentRepository } from "./commitment.repository.js"
import {
  CommitmentMonitoringQueryParams,
  CommitmentNationalResponse,
  CommitmentNeedStocksResponse,
  CommitmentProvinceResponse,
  CommitmentRealizationTargetResponse,
  CommitmentSummaryResponse,
  QuarterlyMaterialNeedRow,
} from "./commitment.schema.js"

export class CommitmentMonitoringModule {
  constructor(
    private readonly repo: CommitmentRepository,
    private readonly commitmentExcel: CommitmentMonitoringExcel
  ) {}

  private toCeilInt(value: number | null | undefined): number | null {
    if (value == null) return null

    return Math.ceil(value - 1e-6)
  }

  private toPositiveNumberOrZero(value: number | null | undefined): number {
    const numericValue = Number(value ?? 0)
    return numericValue > 0 ? numericValue : 0
  }

  async getSummary(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ): Promise<CommitmentSummaryResponse> {
    const summary = await this.repo.getSummaryFinal(c, queryParams)

    return {
      annual_needs: {
        value: this.toCeilInt(summary.annual_needs_value) ?? 0,
        deviation:
          summary.annual_needs_deviation != null &&
          summary.annual_needs_deviation > 0
            ? this.toCeilInt(summary.annual_needs_deviation)
            : null,
      },
      annual_commitment: {
        value: this.toCeilInt(summary.annual_commitment_value) ?? 0,
        deviation:
          summary.annual_commitment_deviation != null &&
          summary.annual_commitment_deviation > 0
            ? this.toCeilInt(summary.annual_commitment_deviation)
            : null,
      },
    }
  }

  async getNational(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ): Promise<CommitmentNationalResponse> {
    const national = await this.repo.getNationalFinal(c, queryParams)

    return {
      title: c.var.t("dashboard.commitment_monitoring.title_national"),
      labels: [""],
      datasets: [
        {
          label: c.var.t("dashboard.commitment_monitoring.buffer_not_sent"),
          value: this.toCeilInt(national.buffer_not_sent) ?? 0,
          color: "#0BA6E0",
        },
        {
          label: c.var.t("dashboard.commitment_monitoring.buffer_sent"),
          value: this.toCeilInt(national.buffer_sent) ?? 0,
          color: "#FFC002",
        },
        {
          label: c.var.t("dashboard.commitment_monitoring.allocation_sent"),
          value: this.toCeilInt(national.allocation_sent) ?? 0,
          color: "#4FC44D",
        },
        {
          label: c.var.t("dashboard.commitment_monitoring.allocation_not_sent"),
          value: this.toCeilInt(national.allocation_not_sent) ?? 0,
          color: "#D9D9D9",
        },
      ],
    }
  }

  async getProvince(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ): Promise<CommitmentProvinceResponse> {
    const provinceRows = await this.repo.getProvinceRows(c, queryParams)

    return {
      title: c.var.t("dashboard.commitment_monitoring.title_province"),
      data: provinceRows.map((row) => {
        const provinceId = Number(row.province_id)
        return {
          is_commitment: Boolean(row.is_commitment),
          province: {
            id: provinceId,
            name: row.province_name,
          },
          total_commitment_reguler_dose: Number(
            row.total_commitment_reguler_dose ?? 0
          ),
          total_used_reguler_dose: Number(row.total_used_reguler_dose ?? 0),
          total_unused_reguler_dose: this.toPositiveNumberOrZero(
            row.total_unused_reguler_dose
          ),
          total_commitment_reguler_vial: Number(
            row.total_commitment_reguler_vial ?? 0
          ),
          total_used_reguler_vial: Number(row.total_used_reguler_vial ?? 0),
          total_unused_reguler_vial: this.toPositiveNumberOrZero(
            row.total_unused_reguler_vial
          ),
          total_used_buffer_dose: Number(row.total_used_buffer_dose ?? 0),
          total_used_buffer_vial: Number(row.total_used_buffer_vial ?? 0),
          total_yearly_need: this.toCeilInt(Number(row.total_yearly_need ?? 0)),
        }
      }),
    }
  }

  async getNeedStocks(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ): Promise<CommitmentNeedStocksResponse> {
    const needStocks = await this.repo.getNeedStocksFinal(c, queryParams)

    return {
      title: c.var.t("dashboard.commitment_monitoring.title_annual_needs"),
      labels: [""],
      datasets: [
        {
          label: c.var.t("dashboard.commitment_monitoring.consumption"),
          value: this.toCeilInt(needStocks.total_consumed) ?? 0,
          color: "#FF6A3D",
        },
        {
          label: c.var.t("dashboard.commitment_monitoring.stocks"),
          value: this.toCeilInt(needStocks.total_stock) ?? 0,
          color: "#1F5FD1",
        },
        {
          label: c.var.t(
            "dashboard.commitment_monitoring.remaining_annual_needs"
          ),
          value:
            needStocks.total_remaining != null && needStocks.total_remaining > 0
              ? this.toCeilInt(needStocks.total_remaining)
              : null,
          color: "#D9D9D9",
        },
      ],
    }
  }

  async getRealizationTarget(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ): Promise<CommitmentRealizationTargetResponse> {
    const realizationTarget = await this.repo.getRealizationTargetFinal(
      c,
      queryParams
    )

    const commitmentSent = Number(realizationTarget.commitment_sent ?? 0)
    const totalCommitment = Number(realizationTarget.total_commitment ?? 0)
    const commitmentNotSent = totalCommitment - commitmentSent
    const totalAllocation = commitmentSent + commitmentNotSent

    const flags = [
      {
        step: 1,
        date: `${queryParams.year}-03-13`,
        percent: 20,
        quantity: Math.round((20 / 100) * totalAllocation),
      },
      {
        step: 2,
        date: `${queryParams.year}-07-01`,
        percent: 50,
        quantity: Math.round((50 / 100) * totalAllocation),
      },
      {
        step: 3,
        date: `${queryParams.year}-10-19`,
        percent: 80,
        quantity: Math.round((80 / 100) * totalAllocation),
      },
      {
        step: 4,
        date: `${queryParams.year}-12-31`,
        percent: 100,
        quantity: Math.round(totalAllocation),
      },
    ]

    return {
      title: c.var.t(
        "dashboard.commitment_monitoring.title_realization_target"
      ),
      flags: flags,
      labels: [""],
      datasets: [
        {
          label: c.var.t("dashboard.commitment_monitoring.commitment_sent"),
          value: commitmentSent,
          color: "#35D298",
        },
        {
          label: c.var.t("dashboard.commitment_monitoring.commitment_not_sent"),
          value: commitmentNotSent,
          color: "#A7F3D0",
        },
      ],
    }
  }

  async getExcelExport(
    c: Context,
    queryParams: CommitmentMonitoringQueryParams
  ) {
    const [materialRows, provinceMaterialRows, yearlyNeedRows, provinceNames] =
      await Promise.all([
        this.repo.getMaterialExcelRows(c, queryParams),
        this.repo.getProvinceMaterialExcelRows(c, queryParams),
        this.repo.getYearlyNeedByProvinceMaterial(c, queryParams),
        this.repo.getProvinceNames(),
      ])

    const provinceData = this.mergeProvinceWithYearlyNeed(
      provinceMaterialRows,
      yearlyNeedRows,
      provinceNames
    )

    return await this.commitmentExcel.generateExcel(
      c,
      materialRows,
      provinceData
    )
  }

  private mergeProvinceWithYearlyNeed(
    provinceMaterialRows: Array<{
      province_id: number
      province_name: string
      material_id: number
      material_name: string
      contract_number: string | null
      total_commitment_reguler_dose: number
      total_used_reguler_dose: number
      total_unused_reguler_dose: number
      total_used_buffer_dose: number
    }>,
    yearlyNeedRows: Array<{
      province_id: number
      material_id: number
      material_name: string
      need_qty: number
    }>,
    provinceNames: Array<{
      province_id: number
      province_name: string
    }>
  ) {
    const provinceNamesMap = new Map<number, string>()
    for (const p of provinceNames) {
      provinceNamesMap.set(Number(p.province_id), p.province_name)
    }

    const grouped = new Map<
      string,
      {
        province_id: number
        province_name: string
        material_id: number
        material_name: string
        contract_number: string
        total_commitment_reguler_dose: number
        total_used_buffer_dose: number
        total_used_reguler_dose: number
        total_unused_reguler_dose: number
      }
    >()

    for (const row of provinceMaterialRows) {
      const key = `${row.province_id}-${row.material_id}`
      const existing = grouped.get(key)

      if (!existing || Number(row.total_commitment_reguler_dose) > 0) {
        grouped.set(key, {
          province_id: Number(row.province_id),
          province_name: row.province_name,
          material_id: Number(row.material_id),
          material_name: row.material_name,
          contract_number: row.contract_number || "",
          total_commitment_reguler_dose: Number(
            row.total_commitment_reguler_dose ?? 0
          ),
          total_used_buffer_dose: Number(row.total_used_buffer_dose ?? 0),
          total_used_reguler_dose: Number(row.total_used_reguler_dose ?? 0),
          total_unused_reguler_dose: Number(row.total_unused_reguler_dose ?? 0),
        })
      }
    }

    const results: Array<{
      province_id: number
      province_name: string
      material_name: string
      contract_number: string
      total_yearly_need: number | null
      total_commitment_reguler_dose: number
      total_used_buffer_dose: number
      total_used_reguler_dose: number
      total_unused_reguler_dose: number
    }> = []

    const matchedKeys = new Set<string>()

    for (const item of grouped.values()) {
      const yearlyNeed = yearlyNeedRows.find(
        (need) =>
          Number(need.province_id) === item.province_id &&
          Number(need.material_id) === item.material_id
      )

      if (yearlyNeed) {
        matchedKeys.add(`${item.province_id}-${item.material_id}`)
      }

      results.push({
        province_id: item.province_id,
        province_name: item.province_name,
        material_name: item.material_name,
        contract_number: item.contract_number,
        total_yearly_need: yearlyNeed ? Number(yearlyNeed.need_qty) : null,
        total_commitment_reguler_dose: item.total_commitment_reguler_dose,
        total_used_buffer_dose: item.total_used_buffer_dose,
        total_used_reguler_dose: item.total_used_reguler_dose,
        total_unused_reguler_dose: item.total_unused_reguler_dose,
      })
    }

    for (const yearlyNeed of yearlyNeedRows) {
      const key = `${yearlyNeed.province_id}-${yearlyNeed.material_id}`
      if (!matchedKeys.has(key) && !grouped.has(key)) {
        const provinceName =
          provinceNamesMap.get(Number(yearlyNeed.province_id)) ?? ""
        results.push({
          province_id: Number(yearlyNeed.province_id),
          province_name: provinceName,
          material_name: yearlyNeed.material_name,
          contract_number: "",
          total_yearly_need: Number(yearlyNeed.need_qty),
          total_commitment_reguler_dose: 0,
          total_used_buffer_dose: 0,
          total_used_reguler_dose: 0,
          total_unused_reguler_dose: 0,
        })
      }
    }

    return results.sort((a, b) => a.province_id - b.province_id)
  }

  async sendQuarterlyNeedsEmail(): Promise<{ message: string }> {
    console.log("Starting quarterly needs email process...")

    const [materials, users] = await Promise.all([
      this.repo.getQuarterlyMaterialNeeds(),
      this.repo.getQuarterlyNeedsEmailUsers(),
    ])

    const vaccines = materials.filter((m) => !m.is_supporting_material)
    const supportingMaterials = materials.filter(
      (m) => m.is_supporting_material
    )

    if (vaccines.length === 0 && supportingMaterials.length === 0) {
      console.log("No materials below stock threshold. Skipping email sending.")
      return { message: "No materials below stock threshold." }
    }

    if (users.length === 0) {
      console.log("No eligible users found. Skipping email sending.")
      return { message: "No eligible users found." }
    }

    const content = this.buildQuarterlyNeedsEmailContent(
      vaccines,
      supportingMaterials
    )
    const subject =
      "Persediaan Vaksin dan Material Penunjang Nasional di Bawah 50% Kebutuhan"

    const transport = new Mailer()
    await Promise.all(
      users.map(async (u) => {
        try {
          await transport.sendMail(u.email, subject, content)
          console.log(`Email sent to user ${u.id} (${u.email})`)
        } catch (error) {
          console.error(
            `Failed to send quarterly needs email to user ${u.id}:`,
            error
          )
        }
      })
    )

    console.log(
      `Quarterly needs email process completed. Sent to ${users.length} users.`
    )
    return {
      message: `Quarterly needs email sent to ${users.length} users.`,
    }
  }

  private buildQuarterlyNeedsEmailContent(
    vaccines: QuarterlyMaterialNeedRow[],
    supportingMaterials: QuarterlyMaterialNeedRow[]
  ): string {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const templatePath = resolve(
      __dirname,
      "../../../../public/templates/commitment/quarterly-needs-email.html"
    )
    let template = readFileSync(templatePath, "utf-8")

    const formatNumber = (num: number) =>
      Math.floor(num).toLocaleString("id-ID")

    const formatMaterialName = (materialName: string) => {
      const atIndex = materialName.indexOf("@")
      if (atIndex === -1) return materialName.trim()

      return materialName.slice(0, atIndex).trimEnd()
    }

    let vaccineSection = ""
    if (vaccines.length > 0) {
      const vaccineItems = vaccines
        .map(
          (v) =>
            `<li><b>${formatMaterialName(v.material_name)}</b>: ${formatNumber(v.total_balance)} dari total kebutuhan ${formatNumber(v.needs_this_quartal)}</li>`
        )
        .join("\n        ")

      vaccineSection = `
        <div class="section">
          <h3 class="section-title">Vaksin</h3>
          <p class="section-description">Berdasarkan data terkini dari Aplikasi SMILE, terdeteksi bahwa beberapa persediaan vaksin memiliki stok yang berada <b>di bawah 50% dari total kebutuhan kuartal nasional</b>, sehingga berisiko mengganggu kelancaran program imunisasi rutin.</p>
          <ul class="material-list">
            ${vaccineItems}
          </ul>
        </div>`
    }

    let supportingMaterialSection = ""
    if (supportingMaterials.length > 0) {
      const supportingItems = supportingMaterials
        .map(
          (m) =>
            `<li><b>${formatMaterialName(m.material_name)}</b>: ${formatNumber(m.total_balance)} dari total kebutuhan ${formatNumber(m.needs_this_quartal)}</li>`
        )
        .join("\n        ")

      supportingMaterialSection = `
        <div class="section">
          <h3 class="section-title">Material Penunjang</h3>
          <p class="section-description">Berdasarkan data terkini dari Aplikasi SMILE, terdeteksi bahwa beberapa persediaan material penunjang memiliki stok yang berada <b>di bawah 50% dari total kebutuhan kuartal nasional</b>, sehingga berisiko mengganggu kelancaran program imunisasi rutin.</p>
          <ul class="material-list">
            ${supportingItems}
          </ul>
        </div>`
    }

    template = template.replace("{{vaccine_section}}", vaccineSection)
    template = template.replace(
      "{{supporting_material_section}}",
      supportingMaterialSection
    )

    return template
  }
}
