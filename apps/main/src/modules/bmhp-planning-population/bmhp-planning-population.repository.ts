import { Context } from "hono"
import { sql } from "kysely"
import { PopulateCalculateQuery } from "./bmhp-planning-population.schema.js"

export class BmhpPlanningPopulationRepository {
  async getPopulateCalculate(c: Context, query: PopulateCalculateQuery) {
    const { province_id, program_plan_id } = query

    // Get program plan details (year only)
    const programPlanData = await c.var.trx
      .selectFrom("ws_program_plans as wpp")
      .select(["wpp.year"])
      .where("wpp.id", "=", program_plan_id)
      .where("wpp.deleted_at", "is", null)
      .executeTakeFirst()

    if (!programPlanData) {
      return {
        year_plan: null,
        data: [],
      }
    }

    // Get province-level aggregated data with latest user info
    const provinceData = await c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_bmhp_planning as wp" as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("entities as e" as any, "e.id", "wp.entity_id")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("locations as prov" as any, (join: any) =>
        join.onRef("prov.id", "=", "e.province_id")
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("bmhp_examinations as be" as any, "be.id", "wp.examination_id")

      .innerJoin(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "ws_bmhp_planning_target_groups as wptg" as any,
        "wptg.planning_id",
        "wp.id"
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("target_groups as tg" as any, "tg.id", "wptg.target_group_id")
      // Get the user who made the latest update for this target group
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .leftJoin("ws_users as latest_user" as any, (join: any) =>
        join.on(
          "latest_user.id",
          "=",
          sql`(
            SELECT wptg2.updated_by
            FROM ws_bmhp_planning_target_groups wptg2
            INNER JOIN ws_bmhp_planning wp2 ON wp2.id = wptg2.planning_id
            INNER JOIN entities e2 ON e2.id = wp2.entity_id
            INNER JOIN bmhp_examinations be2 ON be2.id = wp2.examination_id
            WHERE wptg2.target_group_id = wptg.target_group_id
              AND e2.province_id = ${province_id}
              AND be2.program_plan_id = ${program_plan_id}
              AND wp2.deleted_at IS NULL
              AND wptg2.deleted_at IS NULL
              AND wptg2.test_count > 0
            ORDER BY wptg2.updated_at DESC
            LIMIT 1
          )`
        )
      )
      .select([
        "tg.id as target_group_id",
        "tg.title as target_group_name",
        sql<number>`SUM(wptg.test_count)`.as("total_test_count"),
        sql<Date>`MAX(wptg.updated_at)`.as("updated_at"),
        "latest_user.id as updated_user_id",
        "latest_user.username as updated_user_username",
        "latest_user.firstname as updated_user_firstname",
        "latest_user.lastname as updated_user_lastname",
      ])
      .where("e.province_id", "=", province_id)
      .where("be.program_plan_id", "=", program_plan_id)
      .where("wp.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .where(sql`wptg.test_count`, ">", 0)
      .groupBy([
        "tg.id",
        "tg.title",
        "latest_user.id",
        "latest_user.username",
        "latest_user.firstname",
        "latest_user.lastname",
      ])
      .execute()

    // Get province name
    const provinceName = await c.var.trx
      .selectFrom("locations")
      .select("name")
      .where("id", "=", province_id)
      .executeTakeFirst()

    // Get all Dinkes entities in this province for representative selection
    const dinkesEntities = await c.var.trx
      .selectFrom("entities as e")
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "e.regency_id as regency_id",
      ])
      .where("e.province_id", "=", String(province_id))
      .where("e.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          eb("e.name", "like", "%DINKES%"),
          eb("e.name", "like", "%DINAS KESEHATAN%"),
          eb("e.name", "like", "%DINAS KES%"),
          eb("e.name", "like", "%DIKES%"),
          eb("e.name", "like", "DKK%"),
        ])
      )
      .execute()

    // Get entity-level data with pagination
    const entityDataQuery = c.var.trx
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectFrom("ws_bmhp_planning as wp" as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("entities as e" as any, "e.id", "wp.entity_id")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("locations as prov" as any, (join: any) =>
        join.onRef("prov.id", "=", "e.province_id")
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .leftJoin("locations as reg" as any, (join: any) =>
        join.onRef("reg.id", "=", "e.regency_id")
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("bmhp_examinations as be" as any, "be.id", "wp.examination_id")

      .innerJoin(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "ws_bmhp_planning_target_groups as wptg" as any,
        "wptg.planning_id",
        "wp.id"
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .innerJoin("target_groups as tg" as any, "tg.id", "wptg.target_group_id")
      // Get the user who made the latest update for this entity + target group
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .leftJoin("ws_users as latest_user" as any, (join: any) =>
        join.on(
          "latest_user.id",
          "=",
          sql`(
            SELECT wptg2.updated_by
            FROM ws_bmhp_planning_target_groups wptg2
            INNER JOIN ws_bmhp_planning wp2 ON wp2.id = wptg2.planning_id
            INNER JOIN bmhp_examinations be2 ON be2.id = wp2.examination_id
            WHERE wptg2.target_group_id = wptg.target_group_id
              AND wp2.entity_id = wp.entity_id
              AND be2.program_plan_id = ${program_plan_id}
              AND wp2.deleted_at IS NULL
              AND wptg2.deleted_at IS NULL
              AND wptg2.test_count > 0
            ORDER BY wptg2.updated_at DESC
            LIMIT 1
          )`
        )
      )
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "e.parent_id as parent_id",
        "e.regency_id as regency_id",
        "prov.name as province_name",
        "reg.name as regency_name",
        "tg.id as target_group_id",
        "tg.title as target_group_name",
        sql<number>`SUM(wptg.test_count)`.as("total_test_count"),
        sql<Date>`MAX(wptg.updated_at)`.as("updated_at"),
        "latest_user.id as updated_user_id",
        "latest_user.username as updated_user_username",
        "latest_user.firstname as updated_user_firstname",
        "latest_user.lastname as updated_user_lastname",
      ])
      .where("e.province_id", "=", province_id)
      .where("be.program_plan_id", "=", program_plan_id)
      .where("wp.deleted_at", "is", null)
      .where("wptg.deleted_at", "is", null)
      .where(sql`wptg.test_count`, ">", 0)
      .groupBy([
        "e.id",
        "e.name",
        "prov.name",
        "reg.name",
        "tg.id",
        "tg.title",
        "latest_user.id",
        "latest_user.username",
        "latest_user.firstname",
        "latest_user.lastname",
      ])
      .orderBy(["e.name", "tg.id"])

    const entityData = await entityDataQuery.execute()

    return {
      year_plan: programPlanData.year,
      province_data: provinceData,
      province_name: provinceName?.name || null,
      entity_data: entityData,
      dinkes_entities: dinkesEntities,
    }
  }
}
