import { Context } from "hono"
import {
  GetEnvironmentalTestMethodListQuery,
  ValidationRule,
} from "./environmental-test-method.schema.js"

export class EnvironmentalTestMethodRepository {
  async getList(c: Context, params: GetEnvironmentalTestMethodListQuery) {
    const { page, paginate, keyword, sort_by, sort_type } = params
    const offset = (page - 1) * paginate

    const sortBy = sort_by ?? "name"
    const sortType = sort_type ?? "asc"

    const sortColumnMap = {
      name: "etm.name",
      created_at: "etm.created_at",
      updated_at: "etm.updated_at",
    } as const

    const sortColumn =
      sortColumnMap[sortBy as keyof typeof sortColumnMap] ?? "etm.name"

    let query = c.var.trx
      .selectFrom("environmental_test_methods as etm")
      .where("etm.deleted_at", "is", null)

    if (keyword) {
      query = query.where("etm.name", "like", `%${keyword}%`)
    }

    const [list, totalResult] = await Promise.all([
      query
        .select([
          "etm.id",
          "etm.name",
          "etm.deskripsi",
          "etm.quality_standard",
          "etm.created_at",
          "etm.updated_at",
        ])
        .orderBy(sortColumn, sortType)
        .limit(paginate)
        .offset(offset)
        .execute(),
      query.select((eb) => eb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return {
      list,
      total: Number(totalResult?.total) || 0,
    }
  }

  async getById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_test_methods as etm")
      .select([
        "etm.id",
        "etm.name",
        "etm.deskripsi",
        "etm.quality_standard",
        "etm.created_at",
        "etm.updated_at",
      ])
      .where("etm.id", "=", id)
      .where("etm.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getOnlyById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_test_methods")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async create(
    c: Context,
    data: {
      name: string
      deskripsi?: string | null
      quality_standard?: string | null
    }
  ) {
    return await c.var.trx
      .insertInto("environmental_test_methods")
      .values({
        name: data.name,
        deskripsi: data.deskripsi,
        quality_standard: data.quality_standard,
      })
      .executeTakeFirstOrThrow()
  }

  async update(
    c: Context,
    id: number,
    data: {
      name?: string
      deskripsi?: string | null
      quality_standard?: string | null
    }
  ) {
    return await c.var.trx
      .updateTable("environmental_test_methods")
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async delete(c: Context, id: number) {
    return await c.var.trx
      .updateTable("environmental_test_methods")
      .set({
        deleted_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async checkExists(
    c: Context,
    name: string,
    qualityStandard?: string | null,
    excludeId?: number
  ) {
    let query = c.var.trx
      .selectFrom("environmental_test_methods")
      .select("id")
      .where("name", "=", name)
      .where("deleted_at", "is", null)

    if (qualityStandard !== undefined) {
      if (qualityStandard === null) {
        query = query.where("quality_standard", "is", null)
      } else {
        query = query.where("quality_standard", "=", qualityStandard)
      }
    }

    if (excludeId) {
      query = query.where("id", "!=", excludeId)
    }

    return await query.executeTakeFirst()
  }

  // ==================== Validation Rules ====================

  async getValidationRule(c: Context, testMethodId: number) {
    return await c.var.trx
      .selectFrom("environmental_parameter_validation_rules as epvr")
      .selectAll()
      .where("epvr.test_method_id", "=", testMethodId)
      .where("epvr.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async createValidationRule(
    c: Context,
    testMethodId: number,
    data: ValidationRule
  ) {
    return await c.var.trx
      .insertInto("environmental_parameter_validation_rules" as any)
      .values({
        test_method_id: testMethodId,
        result_format_type: data.result_format_type,
        validation_type: data.validation_type,
        min_value: data.min_value ?? null,
        max_value: data.max_value ?? null,
        comparison_operator: data.comparison_operator ?? null,
        comparison_value: data.comparison_value ?? null,
        allow_decimal: data.allow_decimal ?? false,
      })
      .executeTakeFirstOrThrow()
  }

  async updateValidationRule(
    c: Context,
    testMethodId: number,
    data: ValidationRule
  ) {
    return await c.var.trx
      .updateTable("environmental_parameter_validation_rules" as any)
      .set({
        result_format_type: data.result_format_type,
        validation_type: data.validation_type,
        min_value: data.min_value ?? null,
        max_value: data.max_value ?? null,
        comparison_operator: data.comparison_operator ?? null,
        comparison_value: data.comparison_value ?? null,
        allow_decimal: data.allow_decimal ?? false,
        updated_at: new Date(),
      })
      .where("test_method_id", "=", testMethodId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deleteValidationRule(c: Context, testMethodId: number) {
    return await c.var.trx
      .updateTable("environmental_parameter_validation_rules" as any)
      .set({
        deleted_at: new Date(),
      })
      .where("test_method_id", "=", testMethodId)
      .where("deleted_at", "is", null)
      .execute()
  }

  // ==================== Parameter Options ====================

  async getOptions(c: Context, testMethodId: number) {
    return await c.var.trx
      .selectFrom("environmental_parameter_options as epo")
      .select(["epo.id", "epo.option_value", "epo.sort_order"])
      .where("epo.test_method_id", "=", testMethodId)
      .where("epo.deleted_at", "is", null)
      .orderBy("epo.sort_order", "asc")
      .execute()
  }

  async createOptions(c: Context, testMethodId: number, options: string[]) {
    if (options.length === 0) return

    const values = options.map((option, index) => ({
      test_method_id: testMethodId,
      option_value: option,
      sort_order: index,
    }))

    return await c.var.trx
      .insertInto("environmental_parameter_options" as any)
      .values(values)
      .execute()
  }

  async deleteOptions(c: Context, testMethodId: number) {
    return await c.var.trx
      .updateTable("environmental_parameter_options" as any)
      .set({
        deleted_at: new Date(),
      })
      .where("test_method_id", "=", testMethodId)
      .where("deleted_at", "is", null)
      .execute()
  }
}
