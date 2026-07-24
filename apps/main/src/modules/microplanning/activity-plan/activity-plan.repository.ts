import { Context } from "hono"

export interface ActivityPlanRecord {
  id: number
  microplanning_id: number
  title: string
  objective: string | null
  frequency_id: number | null
  target_group_ids: number[] | null
  location_type_ids: number[] | null
  implementation_schedule: string | null
  material_ids: number[] | null
  budget_estimation: number | null
  budget_source_ids: number[] | null
  other_budget_source_name: string | null
  additional_information: string | null
  number_of_vaccinator: number | null
  pics: string | null
  is_mandatory: number
  has_completed: number
  status: number
  created_by: number | null
  updated_by: number | null
  created_at: Date | null
  updated_at: Date | null
  deleted_at: Date | null
}

export interface ReferenceItem {
  id: number
  name: string
}

export interface ActivityPlanSummary {
  total_plans: number
  completed_plans: number
  mandatory_total: number
  mandatory_completed: number
  optional_total: number
  optional_completed: number
}

export interface BudgetSourceReferenceItem extends ReferenceItem {
  is_custom: number
}

export interface ActivityPlanWithReferences extends ActivityPlanRecord {
  frequency: ReferenceItem | null
  target_groups: ReferenceItem[] | null
  location_types: ReferenceItem[] | null
  materials: ReferenceItem[] | null
  budget_sources: BudgetSourceReferenceItem[] | null
}

export class ActivityPlanRepository {
  async findAllByMicroplanningId(
    c: Context,
    microplanningId: number
  ): Promise<ActivityPlanRecord[]> {
    return c.var.trx
      .selectFrom("ws_microplanning_activity_plans as ap")
      .selectAll()
      .where("ap.microplanning_id", "=", microplanningId)
      .where("ap.deleted_at", "is", null)
      .orderBy("ap.is_mandatory", "desc")
      .orderBy("ap.id", "asc")
      .execute()
  }

  async findById(
    c: Context,
    id: number,
    microplanningId: number
  ): Promise<ActivityPlanRecord | undefined> {
    return c.var.trx
      .selectFrom("ws_microplanning_activity_plans")
      .selectAll()
      .where("id", "=", id)
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getTargetGroupsByIds(
    c: Context,
    ids: number[]
  ): Promise<ReferenceItem[]> {
    if (!ids || ids.length === 0) return []
    return ids.map((id) => ({
      id,
      name: c.var.t(`targets.target_group.${id}`),
    }))
  }

  async getLocationTypesByIds(
    c: Context,
    ids: number[]
  ): Promise<ReferenceItem[]> {
    if (!ids || ids.length === 0) return []
    const config = await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "destination_type")
      .executeTakeFirst()

    if (!config || !config.config) return []

    const configArray = config.config as Array<{ id: number; name: string }>
    return configArray
      .filter((item) => ids.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: c.var.t(`destination_type.label.${item.name}`),
      }))
  }

  async getMaterialsByIds(c: Context, ids: number[]): Promise<ReferenceItem[]> {
    if (!ids || ids.length === 0) return []
    return c.var.trx
      .selectFrom("ws_materials")
      .select(["id", "name"])
      .where("id", "in", ids)
      .execute()
  }

  async getBudgetSourcesByIds(
    c: Context,
    ids: number[],
    otherBudgetSourceName?: string | null
  ): Promise<BudgetSourceReferenceItem[]> {
    if (!ids || ids.length === 0) return []
    const result = await c.var.trx
      .selectFrom("ws_budget_sources")
      .select(["id", "name", "is_custom"])
      .where("id", "in", ids)
      .execute()

    return result.map((r) => ({
      id: r.id,
      name: r.is_custom ? (otherBudgetSourceName ?? r.name) : r.name,
      is_custom: r.is_custom ? 1 : 0,
    }))
  }

  async getFrequencyById(
    c: Context,
    id: number
  ): Promise<ReferenceItem | null> {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "frequencies")
      .executeTakeFirst()

    if (!result?.config) return null

    const configArray = result.config as unknown as Array<{ id: number; name: string }>
    const item = configArray.find((f) => f.id === id)
    if (!item) return null

    return {
      id: item.id,
      name: c.var.t(`frequencies.label.${item.name}`),
    }
  }

  async findByIdWithReferences(
    c: Context,
    id: number,
    microplanningId: number
  ): Promise<ActivityPlanWithReferences | null> {
    const plan = await this.findById(c, id, microplanningId)
    if (!plan) return null

    const [frequency, target_groups, location_types, materials, budget_sources] =
      await Promise.all([
        plan.frequency_id
          ? this.getFrequencyById(c, plan.frequency_id)
          : null,
        plan.target_group_ids
          ? this.getTargetGroupsByIds(c, plan.target_group_ids)
          : null,
        plan.location_type_ids
          ? this.getLocationTypesByIds(c, plan.location_type_ids)
          : null,
        plan.material_ids ? this.getMaterialsByIds(c, plan.material_ids) : null,
        plan.budget_source_ids
          ? this.getBudgetSourcesByIds(
              c,
              plan.budget_source_ids,
              plan.other_budget_source_name
            )
          : null,
      ])

    return {
      ...plan,
      frequency,
      target_groups,
      location_types,
      materials,
      budget_sources,
    }
  }

  async findAllWithReferences(
    c: Context,
    microplanningId: number
  ): Promise<ActivityPlanWithReferences[]> {
    const plans = await this.findAllByMicroplanningId(c, microplanningId)

    const results: ActivityPlanWithReferences[] = []
    for (const plan of plans) {
      const [
        frequency,
        target_groups,
        location_types,
        materials,
        budget_sources,
      ] = await Promise.all([
        plan.frequency_id
          ? this.getFrequencyById(c, plan.frequency_id)
          : null,
        plan.target_group_ids
          ? this.getTargetGroupsByIds(c, plan.target_group_ids)
          : null,
        plan.location_type_ids
          ? this.getLocationTypesByIds(c, plan.location_type_ids)
          : null,
        plan.material_ids
          ? this.getMaterialsByIds(c, plan.material_ids)
          : null,
        plan.budget_source_ids
          ? this.getBudgetSourcesByIds(
              c,
              plan.budget_source_ids,
              plan.other_budget_source_name
            )
          : null,
      ])

      results.push({
        ...plan,
        frequency,
        target_groups,
        location_types,
        materials,
        budget_sources,
      })
    }

    return results
  }

  async create(
    c: Context,
    microplanningId: number,
    data: {
      title: string
      objective?: string | null
      frequency_id?: number | null
      target_group_ids?: number[] | null
      location_type_ids?: number[] | null
      implementation_schedule?: string | null
      material_ids?: number[] | null
      budget_estimation?: number | null
      budget_source_ids?: string
      other_budget_source_name?: string | null
      additional_information?: string | null
      number_of_vaccinator?: number | null
      pics?: string | null
    }
  ) {
    return c.var.trx
      .insertInto("ws_microplanning_activity_plans")
      .values({
        ...data,
        microplanning_id: microplanningId,
        is_mandatory: 0,
        status: 0,
        created_by: c.var.userId,
        updated_by: c.var.userId,
      })
      .executeTakeFirst()
  }

  async update(
    c: Context,
    id: number,
    data: {
      title?: string
      objective?: string | null
      frequency_id?: number | null
      target_group_ids?: string
      location_type_ids?: string
      implementation_schedule?: string | null
      material_ids?: string
      budget_estimation?: number | null
      budget_source_ids?: string
      other_budget_source_name?: string | null
      additional_information?: string | null
      number_of_vaccinator?: number | null
      pics?: string
    }
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_activity_plans")
      .set({
        ...data,
        status: 0,
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getValidLocationTypeIds(c: Context, ids: number[]): Promise<number[]> {
    if (!ids || ids.length === 0) return []
    const config = await c.var.trx
      .selectFrom("ws_microplanning_config")
      .select("config")
      .where("key", "=", "destination_type")
      .executeTakeFirst()

    if (!config || !config.config) return []

    const configArray = config.config as Array<{ id: number; name: string }>
    return configArray
      .filter((item) => ids.includes(item.id))
      .map((item) => item.id)
  }

  async getValidMaterialIds(c: Context, ids: number[]): Promise<number[]> {
    if (!ids || ids.length === 0) return []
    const result = await c.var.trx
      .selectFrom("ws_materials")
      .select("id")
      .where("id", "in", ids)
      .where("material_level_id", "=", 2)
      .execute()
    return result.map((r) => r.id)
  }

  async getValidBudgetSources(c: Context, ids: number[]): Promise<number[]> {
    if (!ids || ids.length === 0) return []
    const result = await c.var.trx
      .selectFrom("ws_budget_sources")
      .select("id")
      .where("id", "in", ids)
      .execute()
    return result.map((r) => r.id)
  }

  async softDelete(c: Context, id: number, microplanningId: number) {
    return c.var.trx
      .updateTable("ws_microplanning_activity_plans")
      .set({
        deleted_at: new Date(),
        updated_by: c.var.userId,
        updated_at: new Date(),
      })
      .where("id", "=", id)
      .where("microplanning_id", "=", microplanningId)
      .where("is_mandatory", "=", 0)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getSummary(
    c: Context,
    microplanningId: number
  ): Promise<ActivityPlanSummary> {
    const result = await c.var.trx
      .selectFrom("ws_microplanning_activity_plans")
      .select((eb) => eb.fn.countAll<number>().as("total_plans"))
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return {
      total_plans: Number(result?.total_plans ?? 0),
    }
  }

  async updateStatusByMicroplanningId(
    c: Context,
    microplanningId: number,
    status: number
  ) {
    return c.var.trx
      .updateTable("ws_microplanning_activity_plans")
      .set({
        status,
        updated_at: new Date(),
      })
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async seedMandatoryPlans(c: Context, microplanningId: number) {
    const mandatoryPlans = [
      {
        title: "Imunisasi Rutin",
        is_mandatory: 1,
        status: 0,
      },
      {
        title: "Imunisasi Kejar",
        is_mandatory: 1,
        status: 0,
      },
    ]

    for (const plan of mandatoryPlans) {
      const existing = await c.var.trx
        .selectFrom("ws_microplanning_activity_plans")
        .select("id")
        .where("microplanning_id", "=", microplanningId)
        .where("title", "=", plan.title)
        .where("is_mandatory", "=", 1)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      if (!existing) {
        await c.var.trx
          .insertInto("ws_microplanning_activity_plans")
          .values({
            ...plan,
            microplanning_id: microplanningId,
            created_by: c.var.userId,
            updated_by: c.var.userId,
          })
          .executeTakeFirst()
      }
    }
  }

  #checkHasCompleted(data: Record<string, unknown>): boolean {
    // A mandatory plan is considered completed if it has at least objective and frequency_id filled
    const hasObjective =
      data.objective !== undefined &&
      data.objective !== null &&
      String(data.objective).trim() !== ""
    const hasFrequency =
      data.frequency_id !== undefined &&
      data.frequency_id !== null &&
      Number(data.frequency_id) > 0

    return hasObjective && hasFrequency
  }
}
