import { Context } from "hono"
import {
  GetParameterCategoryListQuery,
  ParameterCategoryField,
} from "./environmental-parameter-category.schema.js"

export class EnvironmentalParameterCategoryRepository {
  async getList(c: Context, params: GetParameterCategoryListQuery) {
    const { page, paginate, keyword, sort_by, sort_type } = params
    const offset = (page - 1) * paginate

    const sortBy = sort_by ?? "name"
    const sortType = sort_type ?? "asc"

    const sortColumnMap = {
      name: "epc.name",
      created_at: "epc.created_at",
      updated_at: "epc.updated_at",
    } as const

    const sortColumn =
      sortColumnMap[sortBy as keyof typeof sortColumnMap] ?? "epc.name"

    let query = c.var.trx
      .selectFrom("environmental_parameter_categories as epc")
      .where("epc.deleted_at", "is", null)

    if (keyword) {
      query = query.where("epc.name", "like", `%${keyword}%`)
    }

    const [list, totalResult] = await Promise.all([
      query
        .select([
          "epc.id",
          "epc.name",
          "epc.status",
          "epc.created_at",
          "epc.updated_at",
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
      .selectFrom("environmental_parameter_categories as epc")
      .select([
        "epc.id",
        "epc.name",
        "epc.status",
        "epc.created_at",
        "epc.updated_at",
      ])
      .where("epc.id", "=", id)
      .where("epc.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async updateStatus(c: Context, id: number, status: number) {
    return await c.var.trx
      .updateTable("environmental_parameter_categories")
      .set({
        status,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getDetailsByCategoryId(c: Context, categoryId: number) {
    return await c.var.trx
      .selectFrom("ws_environmental_parameter_category_details as epcd")
      .leftJoin(
        "environmental_analysis_parameters as eap",
        "epcd.env_analysis_parameter_id",
        "eap.id"
      )
      .leftJoin(
        "environmental_test_methods as etm",
        "epcd.env_test_method_id",
        "etm.id"
      )
      .leftJoin(
        "environmental_units as eu",
        "eap.unit_id",
        "eu.id"
      )
      .select([
        "epcd.id",
        "epcd.env_analysis_parameter_id",
        "eap.name as parameter_name",
        "eap.unit_id",
        "eu.name as unit_name",
        "epcd.env_test_method_id",
        "etm.name as test_method_name",
        "etm.quality_standard",
      ])
      .where("epcd.env_parameter_category_id", "=", categoryId)
      .where("epcd.deleted_at", "is", null)
      .execute()
  }

  async create(c: Context, data: { name: string }) {
    return await c.var.trx
      .insertInto("environmental_parameter_categories")
      .values({
        name: data.name,
      })
      .executeTakeFirstOrThrow()
  }

  async createDetails(
    c: Context,
    categoryId: number,
    details: Array<{
      env_analysis_parameter_id: number
      env_test_method_ids: number[]
    }>
  ) {
    if (details.length === 0) return

    const values: Array<{
      env_parameter_category_id: number
      env_analysis_parameter_id: number
      env_test_method_id: number
    }> = []
    details.forEach((d) => {
      d.env_test_method_ids.forEach((methodId) => {
        values.push({
          env_parameter_category_id: categoryId,
          env_analysis_parameter_id: d.env_analysis_parameter_id,
          env_test_method_id: methodId,
        })
      })
    })

    if (values.length > 0) {
      await c.var.trx
        .insertInto("ws_environmental_parameter_category_details")
        .values(values)
        .execute()
    }
  }

  async update(c: Context, id: number, data: { name?: string }) {
    return await c.var.trx
      .updateTable("environmental_parameter_categories")
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async updateDetail(
    c: Context,
    id: number,
    data: {
      env_analysis_parameter_id: number
      env_test_method_id: number
    }
  ) {
    return await c.var.trx
      .updateTable("ws_environmental_parameter_category_details")
      .set({
        env_analysis_parameter_id: data.env_analysis_parameter_id,
        env_test_method_id: data.env_test_method_id,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async deleteDetail(c: Context, id: number) {
    return await c.var.trx
      .deleteFrom("ws_environmental_parameter_category_details")
      .where("id", "=", id)
      .execute()
  }

  async deleteDetailsByAnalysisParameter(
    c: Context,
    categoryId: number,
    analysisParameterId: number
  ) {
    return await c.var.trx
      .updateTable("ws_environmental_parameter_category_details")
      .set({ deleted_at: new Date() })
      .where("env_parameter_category_id", "=", categoryId)
      .where("env_analysis_parameter_id", "=", analysisParameterId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async delete(c: Context, id: number) {
    await c.var.trx
      .updateTable("ws_environmental_parameter_category_details")
      .set({
        deleted_at: new Date(),
      })
      .where("env_parameter_category_id", "=", id)
      .execute()

    return await c.var.trx
      .updateTable("environmental_parameter_categories")
      .set({
        deleted_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async checkNameExists(c: Context, name: string, excludeId?: number) {
    let query = c.var.trx
      .selectFrom("environmental_parameter_categories")
      .select("id")
      .where("name", "=", name)
      .where("deleted_at", "is", null)

    if (excludeId) {
      query = query.where("id", "!=", excludeId)
    }

    return await query.executeTakeFirst()
  }

  async getOnlyById(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_parameter_categories")
      .selectAll()
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async checkAnalysisParameterExists(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_analysis_parameters")
      .select("id")
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async checkTestMethodExists(c: Context, id: number) {
    return await c.var.trx
      .selectFrom("environmental_test_methods")
      .select("id")
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  // ==================== Fields Methods ====================

  async getFieldsByCategoryId(c: Context, categoryId: number) {
    return await c.var.trx
      .selectFrom("environmental_parameter_categories_fields")
      .select([
        "id",
        "key",
        "type_data",
        "label",
        "hint",
        "mandatory",
        "options",
      ])
      .where("environmental_parameter_categories_id", "=", categoryId)
      .where("deleted_at", "is", null)
      .execute()
  }

  private generateKeyFromLabel(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/(?:^_+|_+$)/g, "")
  }

  async createFields(
    c: Context,
    categoryId: number,
    fields: ParameterCategoryField[]
  ) {
    if (fields.length === 0) return

    await c.var.trx
      .insertInto("environmental_parameter_categories_fields")
      .values(
        fields.map((field) => ({
          environmental_parameter_categories_id: categoryId,
          key: this.generateKeyFromLabel(field.label),
          type_data: field.type_data,
          label: field.label,
          hint: field.hint ?? null,
          mandatory: field.mandatory,
          options: field.options ?? null,
        }))
      )
      .execute()
  }

  async deleteFieldsByCategoryId(c: Context, categoryId: number) {
    return await c.var.trx
      .deleteFrom("environmental_parameter_categories_fields")
      .where("environmental_parameter_categories_id", "=", categoryId)
      .execute()
  }

  async softDeleteFieldsByCategoryId(c: Context, categoryId: number) {
    return await c.var.trx
      .updateTable("environmental_parameter_categories_fields")
      .set({
        deleted_at: new Date(),
      })
      .where("environmental_parameter_categories_id", "=", categoryId)
      .where("deleted_at", "is", null)
      .execute()
  }
}
