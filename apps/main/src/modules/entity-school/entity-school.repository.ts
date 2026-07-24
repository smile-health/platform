import { SCHOOL_ENTITY_TAG_ID } from "@/common/constants/target.js"
import { Context } from "hono"
import { sql } from "kysely"
import { EntitySchoolPaginatedRequestDTO } from "./entity-school.schema.js"

export class EntitySchoolReposity {
  async getListEntityBySubDistrictAndEntityTag(
    c: Context,
    params: EntitySchoolPaginatedRequestDTO,
    entityTagId: number
  ) {
    const { keyword, sub_district_id } = params

    let baseQuery = c.var.trx
      .selectFrom("ws_entities")
      .where("entity_tag_id", "=", entityTagId)
      .where("program_id", "=", c.var.programId)
      .where((eb) =>
        eb.or([eb("name", "like", "MI%"), eb("name", "like", "SD%")])
      )
      .$if(Boolean(sub_district_id), (qr) =>
        qr.where("sub_district_id", "=", String(sub_district_id))
      )
      .select([
        "id",
        "name",
        sql<number>`CAST(lat AS DOUBLE) as latitude`,
        sql<number>`CAST(lng AS DOUBLE) as longitude`,
      ])

    if (keyword && keyword != "") {
      baseQuery = baseQuery.where("name", "like", `%${keyword}%`)
    }

    const [list, totalList] = await Promise.all([
      baseQuery.execute(),
      baseQuery.select((qb) => qb.fn.countAll().as("total")).executeTakeFirst(),
    ])

    return { list, total: Number(totalList?.total) || 0 }
  }

  async getSchoolsBySubDistrict(c: Context, subDistrictId: number) {
    return await c.var.trx
      .selectFrom("ws_entities")
      .where("entity_tag_id", "=", SCHOOL_ENTITY_TAG_ID)
      .where((eb) =>
        eb.or([eb("name", "like", "MI%"), eb("name", "like", "SD%")])
      )
      .where("sub_district_id", "=", String(subDistrictId))
      .where("program_id", "=", c.var.programId)
      .select([
        "id",
        "name",
        "village_id",
        "sub_district_id",
        "regency_id",
        "province_id",
      ])
      .execute()
  }

  async getSchoolsByMicroplanningId(
    c: Context,
    microplanningId: number,
    isAssigned?: number
  ) {
    return await c.var.trx
      .selectFrom("ws_microplanning_schools")
      .where("microplanning_id", "=", microplanningId)
      .select(["school_id as id", "name", "sub_district_id"])
      .$if(!!isAssigned, (qb) => qb.where("is_assigned", "=", isAssigned!))
      .execute()
  }

  async getList(c: Context, entityTagId: number, provinceId?: number) {
    let query = c.var.trx
      .selectFrom("ws_entities")
      .where("entity_tag_id", "=", entityTagId)
      .where("program_id", "=", c.var.programId)
      .where((eb) =>
        eb.or([eb("name", "like", "MI%"), eb("name", "like", "SD%")])
      )

    if (provinceId) {
      query = query.where("province_id", "=", String(provinceId))
    }

    return query
      .select([
        "id",
        "name",
        "village_id",
        "sub_district_id",
        "regency_id",
        "province_id",
      ])
      .execute()
  }
}
