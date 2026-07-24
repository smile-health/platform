import { Context } from "hono"
import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { EnvironmentalParameterCategoryRepository } from "./environmental-parameter-category.repository.js"
import {
  GetParameterCategoryListQuery,
  CreateParameterCategoryRequest,
  UpdateParameterCategoryRequest,
  ParameterCategoryField,
} from "./environmental-parameter-category.schema.js"
import { PaginatedResponse } from "@smile-health/lib/types/paginate.js"
import { logger } from "@smile-health/lib/logger.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class EnvironmentalParameterCategoryModule {
  constructor(
    private readonly repository: EnvironmentalParameterCategoryRepository
  ) {}

  async list(c: Context, params: GetParameterCategoryListQuery) {
    const { list, total } = await this.repository.getList(c, params)

    const result = []
    for (const item of list) {
      const [details, fields] = await Promise.all([
        this.repository.getDetailsByCategoryId(c, Number(item.id)),
        this.repository.getFieldsByCategoryId(c, Number(item.id)),
      ])
      result.push(this.formatResponse(item, details, fields))
    }

    return new PaginatedResponse(params, result, total)
  }

  async detail(c: Context, id: number) {
    const data = await this.repository.getById(c, id)
    if (!data) return null

    const [details, fields] = await Promise.all([
      this.repository.getDetailsByCategoryId(c, id),
      this.repository.getFieldsByCategoryId(c, id),
    ])

    return this.formatResponse(data, details, fields)
  }

  async create(c: Context, body: CreateParameterCategoryRequest) {
    const result = await this.repository.create(c, {
      name: body.name,
    })

    const categoryId = Number(result.insertId)

    if (body.analysis_parameters && body.analysis_parameters.length > 0) {
      await this.repository.createDetails(
        c,
        categoryId,
        body.analysis_parameters
      )
    }

    // Create fields if provided
    if (body.fields && body.fields.length > 0) {
      await this.repository.createFields(c, categoryId, body.fields)
      this.writeFieldsLocalization(body.fields)
    }

    return { id: categoryId }
  }

  async update(c: Context, id: number, body: UpdateParameterCategoryRequest) {
    if (body.name !== undefined) {
      await this.repository.update(c, id, { name: body.name })
    }

    await this.processDetails(c, id, body.analysis_parameters)

    // Process fields: delete all existing then insert new
    if (body.fields !== undefined) {
      await this.repository.deleteFieldsByCategoryId(c, id)
      if (body.fields.length > 0) {
        await this.repository.createFields(c, id, body.fields)
        this.writeFieldsLocalization(body.fields)
      }
    }
  }

  private async processDetails(
    c: Context,
    categoryId: number,
    details?: UpdateParameterCategoryRequest["analysis_parameters"]
  ) {
    if (!details || details.length === 0) return

    for (const detail of details) {
      if (detail._delete) {
        // Delete all methods/rows for this analysis parameter
        await this.repository.deleteDetailsByAnalysisParameter(
          c,
          categoryId,
          detail.env_analysis_parameter_id
        )
      } else {
        // For simplicity and correctness with multiple methods:
        // Delete all existing methods for this specific analysis parameter
        // then re-insert the current set of methods.
        await this.repository.deleteDetailsByAnalysisParameter(
          c,
          categoryId,
          detail.env_analysis_parameter_id
        )

        // Create new set of details for this parameter
        await this.repository.createDetails(c, categoryId, [
          {
            env_analysis_parameter_id: detail.env_analysis_parameter_id,
            env_test_method_ids: detail.env_test_method_ids,
          },
        ])
      }
    }
  }

  async delete(c: Context, id: number) {
    // Soft delete fields first
    await this.repository.softDeleteFieldsByCategoryId(c, id)
    // Then delete category (which also soft deletes details)
    await this.repository.delete(c, id)
  }

  async updateStatus(c: Context, id: number, status: number) {
    await this.repository.updateStatus(c, id, status)
    return { id, status }
  }

  private formatResponse(
    item: {
      id: unknown
      name: string
      status?: number
      created_at: unknown
      updated_at: unknown
    },
    details: Array<{
      id: number
      env_analysis_parameter_id: number
      parameter_name: string
      unit_id: number | null
      unit_name: string | null
      env_test_method_id: number
      test_method_name: string
      quality_standard?: string
    }>,
    fields: Array<{
      id: number
      key: string
      type_data: string
      label: string
      hint: string | null
      mandatory: number
      options?: string | null
    }> = []
  ) {
    // Group details by analysis_parameter_id
    const groupedDetailsMap: Record<
      number,
      {
        id: number
        env_analysis_parameter_id: number
        parameter_name?: string
        unit_id: number | null
        unit_name: string | null
        test_methods: Array<{
          id: number
          name: string
          quality_standard?: string
        }>
      }
    > = {}
    details.forEach((d) => {
      if (!groupedDetailsMap[d.env_analysis_parameter_id]) {
        groupedDetailsMap[d.env_analysis_parameter_id] = {
          id: d.env_analysis_parameter_id,
          env_analysis_parameter_id: d.env_analysis_parameter_id,
          parameter_name: d.parameter_name,
          unit_id: d.unit_id,
          unit_name: d.unit_name,
          test_methods: [],
        }
      }
      groupedDetailsMap[d.env_analysis_parameter_id].test_methods.push({
        id: d.env_test_method_id,
        name: d.test_method_name,
        quality_standard: d.quality_standard,
      })
    })

    return {
      id: item.id,
      name: item.name,
      status: item.status ?? 1,
      created_at: item.created_at,
      updated_at: item.updated_at,
      analysis_parameters: Object.values(groupedDetailsMap),
      fields: fields.map((f) => ({
        id: f.id,
        key: f.key,
        type_data: f.type_data,
        label: f.label,
        hint: f.hint,
        mandatory: f.mandatory,
        options: f.options,
      })),
    }
  }

  private generateKeyFromLabel(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/(^_+)|(_+$)/g, "")
  }

  private writeFieldsLocalization(fields: ParameterCategoryField[]) {
    const localeFiles = ["en.json", "id.json"]
    // Resolve to project root (backend/)
    const projectRoot = join(__dirname, "..", "..", "..", "..", "..", "..")

    for (const file of localeFiles) {
      const filePath = join(projectRoot, file)
      try {
        let content: Record<string, any> = {}
        try {
          const raw = readFileSync(filePath, "utf-8")
          content = JSON.parse(raw)
        } catch {
          // File doesn't exist or invalid JSON, start fresh
        }

        // Ensure nested structure exists
        if (!content.environmental_health) {
          content.environmental_health = {}
        }
        if (!content.environmental_health.items) {
          content.environmental_health.items = {}
        }

        for (const field of fields) {
          const key = this.generateKeyFromLabel(field.label)
          content.environmental_health.items[key] = {
            label: field.label,
            hint: field.hint ?? "",
          }
        }

        writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf-8")
      } catch (error) {
        logger.error(`Failed to write localization to ${filePath}: ${error}`)
      }
    }
  }
}
