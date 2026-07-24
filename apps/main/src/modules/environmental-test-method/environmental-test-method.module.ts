import { Context } from "hono"
import { EnvironmentalTestMethodRepository } from "./environmental-test-method.repository.js"
import {
  GetEnvironmentalTestMethodListQuery,
  CreateEnvironmentalTestMethodRequest,
  UpdateEnvironmentalTestMethodRequest,
} from "./environmental-test-method.schema.js"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"

export class EnvironmentalTestMethodModule {
  constructor(private readonly repository: EnvironmentalTestMethodRepository) {}

  async list(c: Context, params: GetEnvironmentalTestMethodListQuery) {
    const { list, total } = await this.repository.getList(c, params)

    const result = list.map((item) => this.formatListResponse(item))
    return new PaginatedResponse(params, result, total)
  }

  async detail(c: Context, id: number) {
    const data = await this.repository.getById(c, id)
    if (!data) return null

    // Get validation rule
    const validationRule = await this.repository.getValidationRule(c, id)

    // Get options if validation_type is 'options'
    let options: string[] = []
    if (validationRule?.validation_type === "options") {
      const optionsData = await this.repository.getOptions(c, id)
      options = optionsData.map((opt) => opt.option_value)
    }

    return {
      id: Number(data.id),
      name: data.name,
      deskripsi: data.deskripsi,
      quality_standard: data.quality_standard,
      created_at: data.created_at,
      updated_at: data.updated_at,
      validation: validationRule
        ? {
            result_format_type: validationRule.result_format_type,
            validation_type: validationRule.validation_type,
            min_value: validationRule.min_value
              ? Number(validationRule.min_value)
              : null,
            max_value: validationRule.max_value
              ? Number(validationRule.max_value)
              : null,
            comparison_operator: validationRule.comparison_operator,
            comparison_value: validationRule.comparison_value
              ? Number(validationRule.comparison_value)
              : null,
            allow_decimal: validationRule.allow_decimal,
            options: options.length > 0 ? options : undefined,
          }
        : null,
    }
  }

  async create(c: Context, body: CreateEnvironmentalTestMethodRequest) {
    const result = await this.repository.create(c, {
      name: body.name,
      deskripsi: body.deskripsi,
      quality_standard: body.quality_standard,
    })

    const testMethodId = Number(result.insertId)

    // Create validation rule if provided
    if (body.validation) {
      await this.repository.createValidationRule(
        c,
        testMethodId,
        body.validation
      )

      // Create options if validation_type is 'options'
      if (
        body.validation.validation_type === "options" &&
        body.validation.options
      ) {
        await this.repository.createOptions(
          c,
          testMethodId,
          body.validation.options
        )
      }
    }

    return { id: testMethodId }
  }

  async update(
    c: Context,
    id: number,
    body: UpdateEnvironmentalTestMethodRequest
  ) {
    const updateData: Record<string, unknown> = {}
    if (body.name !== undefined) updateData.name = body.name
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi
    if (body.quality_standard !== undefined)
      updateData.quality_standard = body.quality_standard

    if (Object.keys(updateData).length > 0) {
      await this.repository.update(c, id, updateData as { name?: string })
    }

    // Handle validation rule update
    if (body.validation !== undefined) {
      const existingRule = await this.repository.getValidationRule(c, id)

      if (body.validation === null) {
        // Delete existing validation rule and options
        if (existingRule) {
          await this.repository.deleteValidationRule(c, id)
          await this.repository.deleteOptions(c, id)
        }
      } else if (existingRule) {
        // Update existing validation rule
        await this.repository.updateValidationRule(c, id, body.validation)

        // Handle options update
        if (body.validation.validation_type === "options") {
          // Delete old options and create new ones
          await this.repository.deleteOptions(c, id)
          if (body.validation.options) {
            await this.repository.createOptions(c, id, body.validation.options)
          }
        } else {
          // If validation_type changed from 'options', delete old options
          await this.repository.deleteOptions(c, id)
        }
      } else {
        // Create new validation rule
        await this.repository.createValidationRule(c, id, body.validation)

        // Create options if validation_type is 'options'
        if (
          body.validation.validation_type === "options" &&
          body.validation.options
        ) {
          await this.repository.createOptions(c, id, body.validation.options)
        }
      }
    }
  }

  async delete(c: Context, id: number) {
    // Delete validation rules and options first
    await this.repository.deleteValidationRule(c, id)
    await this.repository.deleteOptions(c, id)
    await this.repository.delete(c, id)
  }

  private formatListResponse(item: {
    id: unknown
    name: string
    deskripsi: string | null
    quality_standard: string | null
    created_at: unknown
    updated_at: unknown
  }) {
    return {
      id: item.id,
      name: item.name,
      deskripsi: item.deskripsi,
      quality_standard: item.quality_standard,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }
  }
}
