import {
  OUT_OF_SCHOOL_TARGET_GROUPS,
  SCHOOL_ENTITY_TAG_ID,
  SCHOOL_TARGET_GROUPS,
  TARGET_GROUP,
  VILLAGE_TARGET_GROUPS,
} from "@/common/constants/target.js"
import { Context } from "hono"
import { sql } from "kysely"
import { BaseRepository } from "../../base.repository.js"
import { TargetConsumptionQueries } from "../dashboard/microplanning-dashboard.schema.js"
import {
  CreateAbsoluteTargetRequestDTO,
  CreateTargetDataInternalDTO,
  CreateTargetIdealDTO,
  NikListRequestDTO,
  UpdateTargetDataRequest,
} from "./targets.schema.js"

type LocationType = "province" | "city" | "district" | "village"

export class TargetsRepository extends BaseRepository<"ws_patients"> {
  constructor() {
    super("ws_patients")
  }

  async findOrCreateMicroplanningByYear(
    c: Context,
    entityId: number,
    year: number
  ): Promise<{ id: number; year: number }> {
    const existing = await c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "year"])
      .where("entity_id", "=", entityId)
      .where("year", "=", year)
      .where("deleted_at", "is", null)
      .orderBy("id", "asc")
      .executeTakeFirst()

    if (existing) {
      return { id: Number(existing.id), year: existing.year ?? year }
    }

    const result = await c.var.trx
      .insertInto("ws_microplanning")
      .values({
        entity_id: entityId,
        year: year,
        status: 0,
      })
      .executeTakeFirstOrThrow()

    return { id: Number(result.insertId), year }
  }

  async getMicroplanningById(c: Context, microplanningId: number) {
    return await c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "status", "year"])
      .where("id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  private convertToNewFormat(data: CreateTargetDataInternalDTO) {
    return {
      nik: data.nik,
      identity_type: data.identity_type,
      birth_date: data.date_of_birth,
      gender: data.gender,
      ethnic_id: data.ethnic_id,
      phone_number: data.phone_number,
      province_id: data.registered_province_id,
      regency_id: data.registered_regency_id,
      subdistrict_id: data.registered_subdistrict_id,
      village_id: data.registered_village_id,
      pos_code: data.registered_postal_code?.toString(),
      address: data.registered_address,
      residential_province_id: data.residence_province_id,
      residential_regency_id: data.residence_regency_id,
      residential_subdistrict_id: data.residence_subdistrict_id,
      residential_village_id: data.residence_village_id,
      residential_pos_code: data.residence_postal_code?.toString(),
      residential_address: data.residence_address,
      entity_id: data.entity_id,
      name: data.name,
      marital_status: data.marital_status,
      education_id: data.education_id,
      occupation_id: data.occupation_id,
      religion_id: data.religion_id,
    }
  }

  async create(c: Context, data: CreateTargetDataInternalDTO) {
    const patient = this.convertToNewFormat(data)
    const result = await c.var.trx
      .insertInto("ws_patients")
      .values(patient)
      .executeTakeFirstOrThrow()

    if (result.insertId) {
      await c.var.trx
        .insertInto("ws_microplanning_patient_targets")
        .values({
          microplanning_id: data.microplanning_id,
          patient_id: Number(result.insertId),
          target_group_id: data.target_group_id,
          reff_id: patient.entity_id ?? patient.residential_village_id,
          reff_type: patient.entity_id ? "school" : "village",
          subdistrict_id: patient.residential_subdistrict_id,
          regency_id: patient.residential_regency_id,
          province_id: patient.residential_province_id,
          status: 0,
        })
        .executeTakeFirstOrThrow()
    }

    return result
  }

  async upsertAbsoluteTarget(
    c: Context,
    data: CreateAbsoluteTargetRequestDTO & {
      microplan_id: number
      province_id: number | string
      regency_id: number | string
      district_id: number | string
      village_id?: number | string
    }
  ) {
    const isOutOfSchool = !Number.isInteger(data.target_group_id) ? 1 : 0
    const baseTargetGroupId = Math.floor(data.target_group_id)
    const targetGroupId = data.target_group_id

    // Resolve reff_type and reff_id based on target_group_id and entity_id
    let reffType: string | null = null
    let reffId: number | null = null

    if (data.entity_id) {
      // Determine prefix based on target_group_id
      const prefix =
        VILLAGE_TARGET_GROUPS.includes(targetGroupId) ||
        OUT_OF_SCHOOL_TARGET_GROUPS.includes(targetGroupId)
          ? "village"
          : "school"
      reffType = prefix
      reffId = data.entity_id
    }

    const existing = await c.var.trx
      .selectFrom("ws_microplan_absolute_target")
      .select("id")
      .where("microplan_id", "=", data.microplan_id)
      .where("target_group_id", "=", baseTargetGroupId)
      .where("is_out_of_school", "=", isOutOfSchool)
      .where("province_id", "=", data.province_id)
      .where("regency_id", "=", data.regency_id)
      .where("subdistrict_id", "=", data.district_id)
      .where("deleted_at", "is", null)
      .$if(!!data.village_id, (eb) =>
        eb.where("village_id", "=", data.village_id)
      )
      .$if(!data.village_id, (eb) => eb.where("village_id", "is", null))
      .$if(!!reffType, (eb) => eb.where("reff_type", "=", reffType!))
      .$if(!reffType, (eb) => eb.where("reff_type", "is", null))
      .$if(!!reffId, (eb) => eb.where("reff_id", "=", reffId!))
      .$if(!reffId, (eb) => eb.where("reff_id", "is", null))
      .executeTakeFirst()

    if (existing) {
      return await c.var.trx
        .updateTable("ws_microplan_absolute_target")
        .set({ qty: data.qty })
        .where("id", "=", Number(existing.id))
        .executeTakeFirst()
    } else {
      return await c.var.trx
        .insertInto("ws_microplan_absolute_target")
        .values({
          microplan_id: data.microplan_id,
          target_group_id: baseTargetGroupId,
          is_out_of_school: isOutOfSchool,
          qty: data.qty,
          province_id: data.province_id,
          regency_id: data.regency_id,
          subdistrict_id: data.district_id,
          village_id: data.village_id,
          reff_type: reffType,
          reff_id: reffId,
        })
        .execute()
    }
  }

  async createIgnoreDuplicate(c: Context, data: CreateTargetDataInternalDTO) {
    try {
      const patient = this.convertToNewFormat(data)

      // Try to find existing patient by NIK (getOrCreate pattern)
      const existingPatient = await c.var.trx
        .selectFrom("ws_patients")
        .select(["id"])
        .where("nik", "=", patient.nik)
        .where("deleted_at", "is", null)
        .executeTakeFirst()

      let patientId: number

      if (existingPatient) {
        // Patient already exists, reuse existing id
        patientId = Number(existingPatient.id)
      } else {
        // Insert new patient
        const result = await c.var.trx
          .insertInto("ws_patients")
          .values(patient)
          .executeTakeFirstOrThrow()

        patientId = Number(result.insertId)
      }

      // Insert into ws_microplanning_patient_targets with ignore to avoid duplicates
      await c.var.trx
        .insertInto("ws_microplanning_patient_targets")
        .values({
          microplanning_id: data.microplanning_id,
          patient_id: patientId,
          target_group_id: data.target_group_id,
          reff_id: patient.entity_id ?? patient.residential_village_id,
          reff_type: patient.entity_id ? "school" : "village",
          subdistrict_id: patient.residential_subdistrict_id,
          regency_id: patient.residential_regency_id,
          province_id: patient.residential_province_id,
          status: 0,
        })
        .executeTakeFirstOrThrow()

      return { insertId: BigInt(patientId) }
    } catch (error) {
      // target data exists
      return null
    }
  }

  async existsByNIK(c: Context, nik: string): Promise<boolean> {
    const result = await c.var.trx
      .selectFrom("ws_patients")
      .select(["id"])
      .where("nik", "=", nik)
      .executeTakeFirst()

    return !!result
  }

  async findAllWithGroup(
    c: Context,
    ids: number[],
    subDistrictId: number,
    microplanningId: number
  ) {
    const result = await c.var.trx
      .selectFrom("target_groups as tg")
      .where("tg.id", "in", ids)
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("tg.id", "=", "wmpt.target_group_id")
          .on("wmpt.deleted_at", "is", null)
          .on("wmpt.microplanning_id", "=", microplanningId)
      )
      .leftJoin("ws_patients as wp", (join) =>
        join
          .onRef("wmpt.patient_id", "=", "wp.id")
          .on("wp.deleted_at", "is", null)
      )
      .select((q) => [
        "tg.id",
        "tg.title",
        q.fn.count("wp.id").$castTo<string>().as("qty"),
      ])
      .groupBy("tg.id")
      .orderBy("tg.id")
      .execute()

    return result
  }

  async findEqualAgeGroupCounts(
    c: Context,
    subDistrictId: number,
    microplanningId: number
  ) {
    const results = await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .where("wp.entity_id", "is", null)
      .where("wmpt.subdistrict_id", "=", subDistrictId)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.target_group_id", "in", SCHOOL_TARGET_GROUPS)
      .select((q) => [
        "wmpt.target_group_id",
        "wp.gender",
        q.fn.count("wp.id").$castTo<string>().as("qty"),
      ])
      .groupBy(["wmpt.target_group_id", "wp.gender"])
      .execute()

    return results
  }

  async findAll(c: Context, query: NikListRequestDTO, microplanningId: number) {
    const categoryIdNum = query.category_id
      ? Number(query.category_id)
      : undefined
    const isDecimalCategory =
      categoryIdNum !== undefined && !Number.isInteger(categoryIdNum)
    const baseTargetGroupId = isDecimalCategory
      ? Math.floor(categoryIdNum)
      : categoryIdNum

    const targetGroupId11_1 = 13.1
    const categoryGenderMap: Record<number, number | null> = {
      4.1: null,
      5.1: null,
      7.1: 2,
      [targetGroupId11_1]: 1,
    }

    let result = c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.reff_type", "=", query.prefix)
      .where("wmpt.reff_id", "=", Number(query.id))
      .$if(query.category_id !== undefined && !isDecimalCategory, (q) =>
        q.where("wmpt.target_group_id", "=", baseTargetGroupId!)
      )
      .$if(isDecimalCategory, (q) => {
        const gender = categoryGenderMap[categoryIdNum!]
        let subQuery = q
          .where("wmpt.target_group_id", "=", baseTargetGroupId!)
          .where("wmpt.reff_type", "=", "village")
        if (gender !== null && gender !== undefined) {
          subQuery = subQuery.where("wp.gender", "=", gender)
        }

        return subQuery
      })
      .select([
        "wp.nik",
        "wp.id",
        "wp.birth_date as date_of_birth",
        "wp.gender",
      ])

    if (query.keyword) {
      result = result.where("wp.nik", "like", `%${query.keyword}%`)
    }

    result = result.orderBy("wp.id", "desc")

    const offset = (query.page - 1) * query.paginate
    const [list, totalList, name, categoryData] = await Promise.all([
      result.limit(query.paginate).offset(offset).execute(),
      result
        .select((q) => q.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
      query.prefix === "school"
        ? c.var.trx
            .selectFrom("ws_entities")
            .select("name")
            .where("id", "=", Number(query.id))
            .executeTakeFirst()
            .then(
              (entityResult) =>
                entityResult ??
                c.var.trx
                  .selectFrom("locations")
                  .select((eb) =>
                    eb
                      .fn<string>("CONCAT", [eb.val("DESA "), eb.ref("name")])
                      .as("name")
                  )
                  .where("id", "=", Number(query.id))
                  .executeTakeFirst()
            )
        : c.var.trx
            .selectFrom("locations")
            .select("name")
            .where("id", "=", Number(query.id))
            .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_patients as wp")
        .innerJoin(
          "ws_microplanning_patient_targets as wmpt",
          "wmpt.patient_id",
          "wp.id"
        )
        .leftJoin("target_groups as tg", "wmpt.target_group_id", "tg.id")
        .select("tg.id as category_id")
        .where("wmpt.reff_type", "=", query.prefix)
        .where("wmpt.reff_id", "=", Number(query.id))
        .where("wmpt.deleted_at", "is", null)
        .where("wmpt.target_group_id", "is not", null)
        .$if(query.category_id !== undefined && !isDecimalCategory, (q) =>
          q.where("wmpt.target_group_id", "=", baseTargetGroupId!)
        )
        .$if(isDecimalCategory, (q) => {
          const gender = categoryGenderMap[categoryIdNum!]
          let subQuery = q
            .where("wmpt.target_group_id", "=", baseTargetGroupId!)
            .where("wmpt.reff_type", "=", "village")

          if (gender !== null && gender !== undefined) {
            subQuery = subQuery.where("wp.gender", "=", gender)
          }

          return subQuery
        })
        .limit(1)
        .executeTakeFirst(),
    ])

    let formattedName: string | null = null
    if (query.prefix === "school") {
      formattedName = name?.name || null
    } else if (name?.name) {
      formattedName = `DESA ${name.name}`
    }

    const finalCategoryId = isDecimalCategory
      ? categoryIdNum
      : categoryData?.category_id || null

    return {
      name: formattedName,
      category_id: finalCategoryId,
      list: list,
      total: Number(totalList?.total) || 0,
    }
  }

  async delete(c: Context, nik: string, microplanningId: number) {
    const patient = await c.var.trx
      .selectFrom("ws_patients")
      .select(["id"])
      .where("nik", "=", nik)
      .executeTakeFirst()

    if (!patient?.id) {
      return false
    }

    const result = await c.var.trx
      .updateTable("ws_microplanning_patient_targets as wmpt")
      .set({
        deleted_at: new Date(),
      })
      .where("patient_id", "=", patient?.id)
      .where("microplanning_id", "=", microplanningId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    return (result.numChangedRows ?? 0) > 0
  }

  async findByNik(c: Context, nik: string, microplanningId: number) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .leftJoin("educations as edu", "wp.education_id", "edu.id")
      .leftJoin("occupations as occ", "wp.occupation_id", "occ.id")
      .leftJoin("religions as rel", "wp.religion_id", "rel.id")
      .leftJoin("ethnics as eth", "wp.ethnic_id", "eth.id")
      .leftJoin("target_groups as tg", "wmpt.target_group_id", "tg.id")
      .select([
        "wp.id",
        "wp.nik",
        "wp.gender",
        "wp.birth_date as date_of_birth",
        "wp.pos_code as registered_postal_code",
        "wp.village_id as registered_village_id",
        "wp.address as registered_address",
        "wp.residential_pos_code as residence_postal_code",
        "wp.residential_village_id as residence_village_id",
        "wp.residential_address as residence_address",
        "wp.entity_id",
        "wmpt.target_group_id",
        "wp.name",
        "wp.marital_status",
        "wp.education_id",
        "edu.title as education_title",
        "wp.occupation_id",
        "occ.title as occupation_title",
        "wp.religion_id",
        "rel.title as religion_title",
        "wp.ethnic_id",
        "eth.title as ethnic_title",
        "wp.phone_number",
        "tg.title as target_group_name",
      ])
      .where("wp.nik", "=", nik)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async update(
    c: Context,
    nik: string,
    data: UpdateTargetDataRequest,
    microplanningId: number
  ) {
    const patient = await c.var.trx
      .selectFrom("ws_patients")
      .select("id")
      .where("nik", "=", nik)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    const result = await c.var.trx
      .updateTable("ws_patients")
      .set({
        village_id: data.registered_village_id,
        pos_code: data.registered_postal_code?.toString(),
        address: data.registered_address,
        residential_village_id: data.residence_village_id,
        residential_pos_code: data.residence_postal_code?.toString(),
        residential_address: data.residence_address,
        entity_id: data.entity_id,
        name: data.name,
        marital_status: data.marital_status ?? 0,
        education_id: data.education_id,
        occupation_id: data.occupation_id,
        religion_id: data.religion_id,
        ethnic_id: data.ethnic_id,
        phone_number: data.phone_number,
        updated_at: new Date(),
      })
      .where("nik", "=", nik)
      .where("deleted_at", "is", null)
      .executeTakeFirst()

    if (patient?.id) {
      await c.var.trx
        .updateTable("ws_microplanning_patient_targets")
        .set({ status: 0, updated_at: new Date() })
        .where("patient_id", "=", Number(patient.id))
        .where("microplanning_id", "=", microplanningId)
        .where("deleted_at", "is", null)
        .execute()
    }

    return (result.numChangedRows ?? 0) > 0
  }

  // This code is mainly used on step 1,2
  async findGroupedTargets(
    c: Context,
    groupBy: "bias" | "non-bias",
    microplanningId: number,
    subDistrictId?: number
  ) {
    if (groupBy === "bias") {
      const query = c.var.trx
        .selectFrom("ws_microplanning_schools as s")
        .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
          join
            .onRef("wmpt.microplanning_id", "=", "s.microplanning_id")
            .onRef("wmpt.reff_id", "=", "s.school_id")
            .on("wmpt.reff_type", "=", "school")
            .on("wmpt.deleted_at", "is", null)
        )
        .leftJoin("target_groups as tg", "tg.id", "wmpt.target_group_id")
        .leftJoin("locations as l", "l.id", "s.sub_district_id")
        .where("s.microplanning_id", "=", microplanningId)
        .where("s.is_assigned", "=", 1)

      const result = await query
        .select([
          "s.school_id as id",
          "s.name",
          "l.name as district",
          "wmpt.target_group_id",
          "tg.title as target_group_title",
        ])
        .execute()

      return result
    } else {
      const query = c.var.trx
        .selectFrom("ws_microplanning_villages as mv")
        .innerJoin("locations as l", "l.id", "mv.village_id")
        .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
          join
            .onRef("wmpt.microplanning_id", "=", "mv.microplanning_id")
            .onRef("wmpt.reff_id", "=", "mv.village_id")
            .on("wmpt.reff_type", "=", "village")
            .on("wmpt.deleted_at", "is", null)
        )
        .leftJoin("target_groups as tg", "tg.id", "wmpt.target_group_id")
        .where("mv.microplanning_id", "=", microplanningId)
        .where("mv.is_assigned", "=", 1)

      const result = await query
        .select([
          "l.id",
          "l.name",
          "wmpt.target_group_id",
          "tg.title as target_group_title",
        ])
        .execute()

      return result
    }
  }

  async findOutOfSchoolTargets(
    c: Context,
    sub_district_id: number,
    target_group_ids: number[],
    microplanningId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .where("wmpt.subdistrict_id", "=", sub_district_id)
      .where("wmpt.target_group_id", "in", target_group_ids)
      .where("wp.entity_id", "is", null)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.deleted_at", "is", null)
      .select(["wmpt.target_group_id"])
      .execute()
  }

  async getTargetsByAgeGroup(
    c: Context,
    locationIds: number[],
    locationType: LocationType,
    gender?: number,
    start_date?: string,
    end_date?: string
  ) {
    const columnMap = {
      province: "residential_province_id" as const,
      city: "residential_regency_id" as const,
      district: "residential_subdistrict_id" as const,
      village: "residential_village_id" as const,
    }

    const locationColumn = columnMap[locationType]

    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .select([locationColumn, "wp.birth_date as date_of_birth"])
      .where("wp.deleted_at", "is", null)
      .where(locationColumn, "in", locationIds)
      .$if(gender !== undefined, (qb) => qb.where("wp.gender", "=", gender!))
      .$if(start_date !== undefined, (qb) =>
        qb.where("wmpt.created_at", ">=", start_date! as any)
      )
      .$if(end_date !== undefined, (qb) =>
        qb.where("wmpt.created_at", "<=", end_date! as any)
      )
      .execute()
  }

  async getConsumptionsByAgeGroup(
    c: Context,
    locationIds: number[],
    locationType: LocationType,
    gender?: number,
    start_date?: string,
    end_date?: string
  ) {
    const columnMap = {
      province: "residential_province_id" as const,
      city: "residential_regency_id" as const,
      district: "residential_subdistrict_id" as const,
      village: "residential_village_id" as const,
    }

    const locationColumn = columnMap[locationType]

    return await c.var.trx
      .selectFrom("ws_patient_immunizations as c")
      .innerJoin("ws_patients as p", "c.patient_id", "p.id")
      .select([`p.${locationColumn}` as any, "p.birth_date"])
      .where("c.deleted_at", "is", null)
      .where("p.deleted_at", "is", null)
      .where(`p.${locationColumn}` as any, "in", locationIds)
      .$if(gender !== undefined, (qb) => qb.where("p.gender", "=", gender!))
      .$if(start_date !== undefined, (qb) =>
        qb.where("c.created_at", ">=", start_date! as any)
      )
      .$if(end_date !== undefined, (qb) =>
        qb.where("c.created_at", "<=", end_date! as any)
      )
      .execute()
  }

  async getAbsoluteTargets(
    c: Context,
    locationIds: number[],
    locationType: LocationType,
    queries: TargetConsumptionQueries
  ) {
    const columnMap = {
      province: "province_id" as const,
      city: "regency_id" as const,
      district: "subdistrict_id" as const,
      village: "village_id" as const,
    }

    const targetColumn = columnMap[locationType]
    const startYear = queries.start_date
      ? new Date(queries.start_date).getFullYear()
      : undefined
    const endYear = queries.end_date
      ? new Date(queries.end_date).getFullYear()
      : undefined

    const query = c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .innerJoin("ws_microplanning as wm", "wmat.microplan_id", "wm.id")
      .leftJoin("ws_entities as e", "wm.entity_id", "e.id")
      .innerJoin("target_groups as tg", "wmat.target_group_id", "tg.id")
      .select((eb) => [
        `wmat.${targetColumn}` as any,
        "e.province_id as entity_province_id",
        "tg.id as material_target_id",
        "tg.title as material_name",
        eb.fn.sum("wmat.qty").as("total"),
      ])
      .where("wmat.deleted_at", "is", null)
      .where("wm.deleted_at", "is", null)
      .where("wm.status", "=", 1)
      .where("tg.deleted_at", "is", null)
      .where(`wmat.${targetColumn}` as any, "in", locationIds)
      .$if(startYear !== undefined, (qb) =>
        qb.where("wm.year", ">=", startYear! as any)
      )
      .$if(endYear !== undefined, (qb) =>
        qb.where("wm.year", "<=", endYear! as any)
      )
      .$if(
        queries.target_group !== undefined && queries.target_group.length > 0,
        (qb) => qb.where("tg.id", "in", queries.target_group)
      )
      .groupBy([`wmat.${targetColumn}`, "e.province_id", "tg.id", "tg.title"])
    return await query.execute()
  }

  async getImmunizationMaterialTargets(c: Context) {
    const materialTargets = await c.var.trx
      .selectFrom("ws_material_targets as mt")
      .innerJoin("ws_materials as m", "mt.material_id", "m.id")
      .select([
        "mt.id as mt_id",
        "m.id as material_id",
        "m.name as material_name",
        "mt.start_ideal_days",
        "mt.end_ideal_days",
        "mt.parent_id",
        "mt.category",
      ])
      .where("mt.type", "=", "immunization")
      .where("mt.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .orderBy("m.parent_id", "asc")
      .orderBy("mt.start_ideal_days", "asc")
      .execute()

    const getBaseName = (target: (typeof materialTargets)[0]): string =>
      target.material_name
        .split("@")[0]
        ?.replaceAll(/\s*\([^)]*\)/g, "")
        .trim() ?? ""

    return materialTargets.map((target) => ({
      ...target,
      material_name: getBaseName(target),
    }))
  }

  async getImmunizationMaterialTargetsFromConfig(
    c: Context,
    _mpProgramConfigIds?: number[]
  ) {
    const materialTargets = await c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin("ws_materials as m", "mc.material_id", "m.id")
      .select([
        "mc.id as mt_id",
        "m.id as material_id",
        "m.name as material_name",
        "mc.start_ideal_days",
        "mc.end_ideal_days",
        "mc.parent_id",
        "mc.category",
      ])
      .where("mc.type", "=", "immunization")
      .where("mc.target_group_id", "!=", 9)
      .where("mc.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .orderBy("m.parent_id", "asc")
      .orderBy("mc.start_ideal_days", "asc")
      .execute()

    const getBaseName = (target: (typeof materialTargets)[0]): string =>
      target.material_name
        .split("@")[0]
        ?.replaceAll(/\s*\([^)]*\)/g, "")
        .trim() ?? ""

    return materialTargets.map((target) => ({
      ...target,
      material_name: getBaseName(target),
    }))
  }

  async getAllImmunizationMaterialTargets(
    c: Context,
    mpProgramConfigIds: number[],
    provinceId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .leftJoin("ws_mp_province_coverage as cov", (join) =>
        join
          .onRef("cov.mp_material_target_config_id", "=", "mc.id")
          .on("cov.province_id", "=", provinceId)
          .on("cov.deleted_at", "is", null)
      )
      .select(["mc.id", "mc.material_id", "mc.start_ideal_days", "mc.category"])
      .where("mc.mp_program_config_id", "in", mpProgramConfigIds)
      .where("mc.type", "=", "immunization")
      .where("mc.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          // Nasional: tidak ada coverage row untuk material ini
          eb.not(
            eb.exists(
              eb
                .selectFrom("ws_mp_province_coverage as cov2")
                .select("cov2.id")
                .where(
                  "cov2.mp_material_target_config_id",
                  "=",
                  eb.ref("mc.id")
                )
                .where("cov2.deleted_at", "is", null)
            )
          ),
          // Atau: ada coverage row untuk provinsi yang dimaksud
          eb.exists(
            eb
              .selectFrom("ws_mp_province_coverage as cov2")
              .select("cov2.id")
              .where("cov2.mp_material_target_config_id", "=", eb.ref("mc.id"))
              .where("cov2.province_id", "=", provinceId)
              .where("cov2.deleted_at", "is", null)
          ),
        ])
      )
      .execute()
  }

  async createTargetIdeals(c: Context, data: CreateTargetIdealDTO[]) {
    if (data.length === 0) return

    await c.var.trx
      .insertInto("ws_microplan_targets_consumptions")
      .values(data)
      .execute()
  }

  async updateTargetIdeals(c: Context, id: number, data) {
    if (data.length === 0) return

    await c.var.trx
      .updateTable("ws_microplan_targets_consumptions")
      .set(data)
      .where("id", "=", id)
      .execute()
  }

  async getMaterialTargetsByIdealDateFromConfig(
    c: Context,
    locationIds: number[],
    locationType: LocationType,
    queries: TargetConsumptionQueries,
    mpProgramConfigIds: number[]
  ) {
    if (locationIds.length === 0) return []

    const columnMap = {
      province: "residential_province_id" as const,
      city: "residential_regency_id" as const,
      district: "residential_subdistrict_id" as const,
      village: "residential_village_id" as const,
    }

    const targetColumn = columnMap[locationType]

    const query = c.var.trx
      .selectFrom("ws_microplan_targets_consumptions as wmts")
      .innerJoin("ws_patients as wp", "wmts.patient_id", "wp.id")
      .innerJoin(
        "ws_mp_material_target_config as mc",
        "mc.id",
        "wmts.material_target_id"
      )
      .innerJoin("ws_materials as m", "mc.material_id", "m.id")
      .innerJoin("ws_microplanning as wm", "wmts.microplanning_id", "wm.id")
      .innerJoin(
        "ws_mp_program_config as pc",
        "pc.id",
        "mc.mp_program_config_id"
      )
      .leftJoin("ws_materials as m_parent", "m.parent_id", "m_parent.id")
      .select((eb) => [
        `wp.${targetColumn}` as any,
        "mc.id as material_target_id",
        eb
          .case()
          .when("m.parent_id", "is not", null)
          .then(eb.ref("m_parent.name"))
          .else(eb.ref("m.name"))
          .end()
          .as("material_base_name"),
        "m.name as material_name",
        eb.fn.count("wmts.id").as("total"),
      ])
      .where("wmts.deleted_at", "is", null)
      .where("wp.deleted_at", "is", null)
      .where("mc.type", "=", "immunization")
      .where("mc.target_group_id", "!=", 9)
      .where("mc.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .where("wm.status", "=", 1)
      .whereRef("wm.year", "=", "pc.year")
      .where(`wp.${targetColumn}` as any, "in", locationIds)
      .where((eb) =>
        eb.or([
          // Tidak ada province coverage → material berlaku nasional
          eb.not(
            eb.exists(
              eb
                .selectFrom("ws_mp_province_coverage as cov2")
                .select("cov2.id")
                .whereRef("cov2.mp_material_target_config_id", "=", "mc.id")
                .where("cov2.deleted_at", "is", null)
            )
          ),
          // Ada coverage dan provinsi target tercakup
          eb.exists(
            eb
              .selectFrom("ws_mp_province_coverage as cov2")
              .select("cov2.id")
              .whereRef("cov2.mp_material_target_config_id", "=", "mc.id")
              .whereRef("cov2.province_id", "=", "wp.residential_province_id")
              .where("cov2.deleted_at", "is", null)
          ),
        ])
      )
      .$if(queries.start_date !== undefined, (qb) =>
        qb.where("wmts.ideal_date", ">=", queries.start_date! as any)
      )
      .$if(queries.end_date !== undefined, (qb) =>
        qb.where("wmts.ideal_date", "<=", queries.end_date! as any)
      )
      .$if(queries.gender !== undefined, (qb) =>
        qb.where("wp.gender", "=", queries.gender)
      )
      .$if(
        queries.material_id !== undefined && queries.material_id.length > 0,
        (qb) => qb.where("m.global_id", "in", queries.material_id)
      )
      .$if(
        queries.target_group !== undefined && queries.target_group.length > 0,
        (qb) => qb.where("wmts.target_group_id", "in", queries.target_group)
      )
      .groupBy([`wp.${targetColumn}`, "mc.id", "material_base_name", "m.name"])

    return await query.execute()
  }

  async getTargetGroup(c: Context, ageInDays: number, gender: number) {
    const targetGroups = gender === 1 ? TARGET_GROUP.MALE : TARGET_GROUP.FEMALE

    const result = await c.var.trx
      .selectFrom("target_groups")
      .select("id")
      .where("age_min", "<=", ageInDays)
      .where("age_max", ">=", ageInDays)
      .where("id", "in", targetGroups)
      .where("deleted_at", "is", null)
      .where("is_active", "=", 1)
      .executeTakeFirst()

    return result
  }

  async getImmunizationMaterialTargetsWithDose(c: Context) {
    const materialTargets = await c.var.trx
      .selectFrom("ws_material_targets as mt")
      .innerJoin("ws_materials as m", "mt.material_id", "m.id")
      .select([
        "mt.id as mt_id",
        "m.id as material_id",
        "m.name as material_name",
        "mt.start_ideal_days",
        "mt.end_ideal_days",
        "mt.parent_id",
        "mt.category",
      ])
      .where("mt.type", "=", "immunization")
      .where("mt.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .orderBy("mt.start_ideal_days", "asc")
      .execute()

    // Get base name: use parent_name if exists, otherwise use material_name
    const getBaseName = (target: (typeof materialTargets)[0]): string =>
      target.material_name
        .split("@")[0]
        ?.replaceAll(/\s*\([^)]*\)/g, "")
        .trim() ?? ""

    // First pass: count total doses per vaccine type
    const doseCountPerVaccine = new Map<string, number>()
    for (const target of materialTargets) {
      const baseName = getBaseName(target)
      doseCountPerVaccine.set(
        baseName,
        (doseCountPerVaccine.get(baseName) ?? 0) + 1
      )
    }

    // Second pass: assign dose numbers and formatted names
    const doseAssigned = new Map<string, number>()
    const result = materialTargets.map((target) => {
      const baseName = getBaseName(target)
      const totalDoses = doseCountPerVaccine.get(baseName) ?? 1
      const currentDose = (doseAssigned.get(baseName) ?? 0) + 1
      doseAssigned.set(baseName, currentDose)

      // Only add [dose] if there are multiple doses
      const formattedName =
        totalDoses > 1 ? `${baseName} ${currentDose}` : baseName

      return {
        mt_id: target.mt_id,
        material_id: target.material_id,
        material_name: target.material_name,
        base_name: baseName,
        dose: currentDose,
        formatted_name: formattedName,
        start_ideal_days: target.start_ideal_days,
        end_ideal_days: target.end_ideal_days,
        parent_id: target.parent_id,
        category: target.category,
      }
    })

    return result
  }

  async getBatchByMaterialId(c: Context, materialIds: number[]) {
    return await c.var.trx
      .selectFrom("ws_batches")
      .where("material_id", "in", materialIds)
      .where("deleted_at", "is", null)
      .orderBy("expired_date", "desc")
      .select(["id", "code", "expired_date"])
      .execute()
  }

  async getMicroplanTargetConsumptions(c: Context, targetId: number) {
    return await c.var.trx
      .selectFrom("ws_microplan_targets_consumptions")
      .where("target_id", "=", targetId)
      .where("deleted_at", "is", null)
      .select(["id", "ideal_date"])
      .execute()
  }

  async getAllMicroplanningsByYear(c: Context) {
    return c.var.trx
      .selectFrom("ws_microplanning")
      .selectAll()
      .where("deleted_at", "is", null)
      .execute()
  }

  async getAllTargetGroups(c: Context) {
    return await c.var.trx
      .selectFrom("target_groups")
      .select(["id", "title", "age_min", "age_max", "is_active"])
      .where("deleted_at", "is", null)
      .where("is_active", "=", 1)
      .orderBy("id")
      .execute()
  }

  async getTargetsCountByGroup(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wp.id",
        "wmpt.patient_id"
      )
      .innerJoin("target_groups as tg", "wmpt.target_group_id", "tg.id")
      .select((q) => [
        "tg.id",
        "tg.title",
        q.fn.count("wp.id").$castTo<string>().as("qty"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("tg.id", "in", targetGroupIds)
      .groupBy("tg.id")
      .orderBy("tg.id")
      .execute()
  }

  async absoluteTargetGroupCounts(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    targetGroupIds: number[]
  ) {
    const integerIds = targetGroupIds.filter((id) => Number.isInteger(id))
    const results: { id: number; qty: number }[] = []

    if (integerIds.length === 0) return results

    const [inSchoolRows, outOfSchoolRows] = await Promise.all([
      // In-school absolute targets (is_out_of_school = 0) → integer IDs
      c.var.trx
        .selectFrom("ws_microplan_absolute_target as wmat")
        .select((q) => [
          "wmat.target_group_id",
          q.fn.sum("wmat.qty").$castTo<string>().as("qty"),
        ])
        .where("wmat.deleted_at", "is", null)
        .where("wmat.microplan_id", "=", microplanningId)
        .where("wmat.subdistrict_id", "=", subDistrictId)
        .where("wmat.is_out_of_school", "=", 0)
        .where("wmat.target_group_id", "in", integerIds)
        .groupBy("wmat.target_group_id")
        .execute(),

      // Out-of-school absolute targets (is_out_of_school = 1) → decimal IDs (base + 0.1)
      c.var.trx
        .selectFrom("ws_microplan_absolute_target as wmat")
        .select((q) => [
          "wmat.target_group_id",
          q.fn.sum("wmat.qty").$castTo<string>().as("qty"),
        ])
        .where("wmat.deleted_at", "is", null)
        .where("wmat.microplan_id", "=", microplanningId)
        .where("wmat.subdistrict_id", "=", subDistrictId)
        .where("wmat.is_out_of_school", "=", 1)
        .where("wmat.target_group_id", "in", integerIds)
        .groupBy("wmat.target_group_id")
        .execute(),
    ])

    for (const row of inSchoolRows) {
      results.push({ id: Number(row.target_group_id), qty: Number(row.qty) })
    }
    for (const row of outOfSchoolRows) {
      results.push({
        id: Number(row.target_group_id) + 0.1,
        qty: Number(row.qty),
      })
    }

    return results
  }

  async getAbsoluteTargetsByEntity(
    c: Context,
    microplanningId: number,
    targetGroupId: number,
    reffType: "village" | "school"
  ) {
    const isOutOfSchool = !Number.isInteger(targetGroupId) ? 1 : 0
    const baseTargetGroupId = Math.floor(targetGroupId)

    let query = c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .where("wmat.deleted_at", "is", null)
      .where("wmat.microplan_id", "=", microplanningId)
      .where("wmat.target_group_id", "=", baseTargetGroupId)
      .where("wmat.is_out_of_school", "=", isOutOfSchool)
      .where("wmat.reff_type", "=", reffType)
      .where("wmat.reff_id", "is not", null)

    if (reffType === "village") {
      query = query
        .leftJoin("locations as l", "l.id", "wmat.reff_id")
        .select([
          "wmat.reff_id as id",
          "wmat.qty as total",
          sql<string>`CONCAT('DESA ', l.name)`.as("village_name"),
        ])
    } else {
      query = query
        .leftJoin("ws_entities as e", "e.id", "wmat.reff_id")
        .select([
          "wmat.reff_id as id",
          "wmat.qty as total",
          "e.name as village_name",
        ])
        .where("e.program_id", "=", c.var.programId)
    }

    return await query.execute()
  }

  async getAbsoluteTargetsGroupedByEntity(
    c: Context,
    microplanningId: number,
    targetGroupIds: number[],
    reffType: "village" | "school"
  ) {
    const integerIds = targetGroupIds.filter((id) => Number.isInteger(id))

    if (integerIds.length === 0) return []

    // Get absolute targets grouped by reff_id and target_group_id
    const rows = await c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .select((q) => [
        "wmat.reff_id as entity_id",
        "wmat.target_group_id",
        q.fn.sum("wmat.qty").$castTo<string>().as("qty"),
      ])
      .where("wmat.deleted_at", "is", null)
      .where("wmat.microplan_id", "=", microplanningId)
      .where("wmat.target_group_id", "in", integerIds)
      .where("wmat.reff_type", "=", reffType)
      .where("wmat.reff_id", "is not", null)
      .where("wmat.is_out_of_school", "=", 0) // In-school/in-village only
      .groupBy(["wmat.reff_id", "wmat.target_group_id"])
      .execute()

    return rows.map((row) => ({
      entity_id: Number(row.entity_id),
      target_group_id: Number(row.target_group_id),
      qty: Number(row.qty),
    }))
  }

  async getAbsoluteTargetsByReffId(
    c: Context,
    reffId: number,
    targetGroupIds: number[],
    reffType: "village" | "school"
  ) {
    const integerIds = targetGroupIds.filter((id) => Number.isInteger(id))

    if (integerIds.length === 0) return []

    const rows = await c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .select((q) => [
        "wmat.target_group_id",
        q.fn.sum("wmat.qty").$castTo<string>().as("qty"),
      ])
      .where("wmat.deleted_at", "is", null)
      .where("wmat.reff_id", "=", reffId)
      .where("wmat.reff_type", "=", reffType)
      .where("wmat.target_group_id", "in", integerIds)
      .where("wmat.microplan_id", "=", c.var.microplanningId!)
      .groupBy("wmat.target_group_id")
      .execute()

    return rows.map((row) => ({
      target_group_id: Number(row.target_group_id),
      count: Number(row.qty),
    }))
  }

  async getAbsoluteTargetsBySubDistrict(
    c: Context,
    subDistrictId: number,
    targetGroupIds: number[],
    microplanningId: number
  ) {
    const integerIds = targetGroupIds.filter((id) => Number.isInteger(id))

    if (integerIds.length === 0) return []

    const rows = await c.var.trx
      .selectFrom("ws_microplan_absolute_target")
      .select((q) => [
        "target_group_id",
        q.fn.sum("qty").$castTo<string>().as("qty"),
      ])
      .where("deleted_at", "is", null)
      .where("microplan_id", "=", microplanningId)
      .where("subdistrict_id", "=", subDistrictId)
      .where("target_group_id", "in", integerIds)
      .where("is_out_of_school", "=", 1)
      .groupBy("target_group_id")
      .execute()

    return rows.map((row) => ({
      target_group_id: Number(row.target_group_id),
      count: Number(row.qty),
    }))
  }

  async getAbsoluteTargetsGroup(
    c: Context,
    params: {
      microplanningId: number
      targetGroupIds: number[]
      subDistrictId?: number
      entityIds?: number[]
    }
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplan_absolute_target")
      .select((q) => ["reff_id as village_id", "target_group_id", "qty"])
      .where("deleted_at", "is", null)
      .where("microplan_id", "=", params.microplanningId)
      .where("target_group_id", "in", params.targetGroupIds)

    if (params.subDistrictId) {
      query = query.where("subdistrict_id", "=", params.subDistrictId)
    }

    if (params.entityIds && params.entityIds.length > 0) {
      query = query.where("reff_id", "in", params.entityIds)
    }

    return await query.execute()
  }

  async absoluteByEntity(
    c: Context,
    microplanningId: number,
    subDistrictId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_microplan_absolute_target")
      .select((q) => ["reff_id as village_id", "target_group_id", "qty"])
      .where("deleted_at", "is", null)
      .where("microplan_id", "=", microplanningId)
      .where("subdistrict_id", "=", subDistrictId)
      .where("target_group_id", "in", targetGroupIds)
      .execute()
  }

  async getMicroplanningsForNextYear(c: Context) {
    // const nextYear = new Date().getFullYear() + 1
    return await c.var.trx
      .selectFrom("ws_microplanning as m")
      .innerJoin("ws_entities as e", "e.id", "m.entity_id")
      .select([
        "m.id as microplanning_id",
        "m.entity_id",
        "m.year",
        "e.sub_district_id",
      ])
      // .where("m.year", "=", nextYear)
      .where("m.deleted_at", "is", null)
      .where("e.deleted_at", "is", null)
      .execute()
  }

  async getVillagesBySubDistrict(c: Context, subDistrictId: number) {
    return await c.var.trx
      .selectFrom("locations")
      .select(["id", "name"])
      .where("parent_id", "=", subDistrictId)
      .where("level", "=", 3)
      .execute()
  }

  async getSchoolsBySubDistrict(c: Context, subDistrictId: number) {
    return await c.var.trx
      .selectFrom("ws_entities")
      .select(["id", "name"])
      .where("sub_district_id", "=", String(subDistrictId))
      .where("entity_tag_id", "=", SCHOOL_ENTITY_TAG_ID)
      .where("program_id", "=", c.var.programId)
      .where("deleted_at", "is", null)
      .execute()
  }

  async getSnapshotCurrentCountsVillage(
    c: Context,
    villageId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wp.id",
        "wmpt.patient_id"
      )
      .select((eb) => [
        "wmpt.target_group_id",
        eb.fn.count("wp.id").$castTo<string>().as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.target_group_id", "is not", null)
      .where("wmpt.reff_id", "=", villageId)
      .where("wmpt.reff_type", "=", "village")
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "in", targetGroupIds)
      .groupBy("wmpt.target_group_id")
      .execute()
  }

  async getSnapshotCurrentCountsSchool(
    c: Context,
    entityId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wp.id",
        "wmpt.patient_id"
      )
      .select((eb) => [
        "wmpt.target_group_id",
        eb.fn.count("wp.id").$castTo<string>().as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.target_group_id", "is not", null)
      .where("wmpt.reff_type", "=", "school")
      .where("wmpt.reff_id", "=", entityId)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "in", targetGroupIds)
      .groupBy("wmpt.target_group_id")
      .execute()
  }

  async getSnapshotCurrentCountsOutOfSchool(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wp.id",
        "wmpt.patient_id"
      )
      .select((eb) => [
        "wmpt.target_group_id",
        eb.fn.count("wp.id").$castTo<string>().as("count"),
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.target_group_id", "is not", null)
      .where("wmpt.reff_type", "=", "out_of_school")
      .where("wmpt.reff_id", "=", subDistrictId)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "in", targetGroupIds)
      .groupBy("wmpt.target_group_id")
      .execute()
  }

  async getSnapshotPromotedCountsVillage(
    c: Context,
    villageId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplan_targets_consumptions as mtc",
        "mtc.patient_id",
        "wp.id"
      )
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("mtc.patient_id", "=", "wmpt.patient_id")
          .onRef("mtc.microplanning_id", "=", "wmpt.microplanning_id")
          .on("wmpt.deleted_at", "is", null)
      )
      .select((eb) => [
        "mtc.target_group_id as original_group",
        eb.fn.countAll().$castTo<string>().as("promoted_count"),
      ])
      .where("wp.deleted_at", "is", null)
      .where("mtc.deleted_at", "is", null)
      .where("mtc.microplanning_id", "=", microplanningId)
      .where("wmpt.reff_type", "=", "village")
      .where("wmpt.reff_id", "=", villageId)
      .whereRef("wmpt.target_group_id", ">", "mtc.target_group_id")
      .where("mtc.target_group_id", "in", targetGroupIds)
      .groupBy("mtc.target_group_id")
      .execute()
  }

  async getSnapshotPromotedCountsSchool(
    c: Context,
    entityId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplan_targets_consumptions as mtc",
        "mtc.patient_id",
        "wp.id"
      )
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("mtc.patient_id", "=", "wmpt.patient_id")
          .onRef("mtc.microplanning_id", "=", "wmpt.microplanning_id")
          .on("wmpt.deleted_at", "is", null)
      )
      .select((eb) => [
        "mtc.target_group_id as original_group",
        eb.fn.countAll().$castTo<string>().as("promoted_count"),
      ])
      .where("wp.deleted_at", "is", null)
      .where("mtc.deleted_at", "is", null)
      .where("mtc.microplanning_id", "=", microplanningId)
      .where("wmpt.reff_type", "=", "school")
      .where("wmpt.reff_id", "=", entityId)
      .whereRef("wmpt.target_group_id", ">", "mtc.target_group_id")
      .where("mtc.target_group_id", "in", targetGroupIds)
      .groupBy("mtc.target_group_id")
      .execute()
  }

  async getSnapshotPromotedCountsOutOfSchool(
    c: Context,
    subDistrictId: number,
    microplanningId: number,
    targetGroupIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplan_targets_consumptions as mtc",
        "mtc.patient_id",
        "wp.id"
      )
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("mtc.patient_id", "=", "wmpt.patient_id")
          .onRef("mtc.microplanning_id", "=", "wmpt.microplanning_id")
          .on("wmpt.deleted_at", "is", null)
      )
      .select((eb) => [
        "mtc.target_group_id as original_group",
        eb.fn.countAll().$castTo<string>().as("promoted_count"),
      ])
      .where("wp.deleted_at", "is", null)
      .where("mtc.deleted_at", "is", null)
      .where("mtc.microplanning_id", "=", microplanningId)
      .where("wmpt.subdistrict_id", "=", subDistrictId)
      .where("wmpt.reff_type", "!=", "school")
      .whereRef("wmpt.target_group_id", ">", "mtc.target_group_id")
      .where("mtc.target_group_id", "in", targetGroupIds)
      .groupBy("mtc.target_group_id")
      .execute()
  }

  async upsertDailyTargetSnapshot(
    c: Context,
    data: {
      snapshot_date: string
      microplanning_id: number
      target_group_id: number
      entity_type: string
      reference_id: number
      sub_district_id: number | null
      current_count: number
      cumulative_count: number
      promoted_out_count: number
      newly_added_count: number
    }
  ) {
    const upsertQuery = sql`
      INSERT INTO ws_daily_target_count_snapshots (
        snapshot_date,
        microplanning_id,
        target_group_id,
        entity_type,
        reference_id,
        sub_district_id,
        current_count,
        cumulative_count,
        promoted_out_count,
        newly_added_count,
        created_at,
        updated_at
      ) VALUES (
        ${data.snapshot_date},
        ${data.microplanning_id},
        ${data.target_group_id},
        ${data.entity_type},
        ${data.reference_id},
        ${data.sub_district_id},
        ${data.current_count},
        ${data.cumulative_count},
        ${data.promoted_out_count},
        ${data.newly_added_count},
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE
        current_count = VALUES(current_count),
        cumulative_count = VALUES(cumulative_count),
        promoted_out_count = VALUES(promoted_out_count),
        newly_added_count = VALUES(newly_added_count),
        updated_at = NOW()
    `
    return await c.var.trx.executeQuery(upsertQuery.compile(c.var.trx))
  }

  async getPreviousDaySnapshot(
    c: Context,
    previousDate: string,
    microplanningId: number,
    entityType: string,
    referenceId: number,
    targetGroupId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_daily_target_count_snapshots")
      .select(["current_count", "cumulative_count"])
      .where("snapshot_date", "=", previousDate)
      .where("microplanning_id", "=", microplanningId)
      .where("entity_type", "=", entityType)
      .where("reference_id", "=", referenceId)
      .where("target_group_id", "=", targetGroupId)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getTargetsWithDateOfBirthByLocation(
    c: Context,
    subDistrictId: number,
    targetGroupId: number,
    microplanningId: number
  ) {
    return await c.var.trx
      .selectFrom("locations as l")
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("l.id", "=", "wmpt.reff_id")
          .on("wmpt.reff_type", "=", "village")
          .on("wmpt.target_group_id", "=", targetGroupId)
          .on("wmpt.microplanning_id", "=", microplanningId)
          .on("wmpt.deleted_at", "is", null)
      )
      .leftJoin("ws_patients as wp", (join) =>
        join
          .onRef("wp.id", "=", "wmpt.patient_id")
          .on("wp.deleted_at", "is", null)
      )
      .where("l.parent_id", "=", subDistrictId)
      .select([
        "l.id as village_id",
        "l.name as village_name",
        "wp.id as target_id",
        "wp.birth_date as date_of_birth",
        "wp.gender",
        "wmpt.target_group_id",
      ])
      .execute()
  }

  async getTargetsWithDateOfBirthByEntity(
    c: Context,
    subDistrictId: number,
    targetGroupId: number,
    microplanningId: number
  ) {
    return await c.var.trx
      .selectFrom("ws_entities as e")
      .leftJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("e.id", "=", "wmpt.reff_id")
          .on("wmpt.reff_type", "=", "school")
          .on("wmpt.target_group_id", "=", targetGroupId)
          .on("wmpt.microplanning_id", "=", microplanningId)
          .on("wmpt.deleted_at", "is", null)
      )
      .leftJoin("ws_patients as wp", (join) =>
        join
          .onRef("wp.id", "=", "wmpt.patient_id")
          .on("wp.deleted_at", "is", null)
      )
      .where("e.sub_district_id", "=", String(subDistrictId))
      .where("e.entity_tag_id", "=", SCHOOL_ENTITY_TAG_ID)
      .where("e.deleted_at", "is", null)
      .where("e.program_id", "=", c.var.programId)
      .select([
        "e.id as entity_id",
        "e.name as entity_name",
        "wp.id as target_id",
        "wp.birth_date as date_of_birth",
        "wp.gender",
        "wmpt.target_group_id",
      ])
      .execute()
  }

  async findMicroplanningByYear(c: Context, entityId: number, year: number) {
    return await c.var.trx
      .selectFrom("ws_microplanning")
      .select(["id", "year"])
      .where("entity_id", "=", entityId)
      .where("year", "=", year)
      .where("deleted_at", "is", null)
      .executeTakeFirst()
  }

  async getTargetsWithDateOfBirthBySchoolId(
    c: Context,
    entityId: number,
    targetGroupId: number,
    microplanningIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wp.id", "=", "wmpt.patient_id")
          .on("wmpt.target_group_id", "=", targetGroupId)
          .on("wmpt.microplanning_id", "in", microplanningIds)
          .on("wmpt.deleted_at", "is", null)
      )
      .where("wmpt.reff_id", "=", entityId)
      .where("wmpt.reff_type", "=", "school")
      .where("wmpt.deleted_at", "is", null)
      .select([
        "wp.id as target_id",
        "wp.birth_date as date_of_birth",
        "wp.gender",
        "wmpt.target_group_id",
      ])
      .execute()
  }

  async getTargetsWithDateOfBirthByVillage(
    c: Context,
    villageId: number,
    targetGroupId: number,
    microplanningIds: number[]
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin("ws_microplanning_patient_targets as wmpt", (join) =>
        join
          .onRef("wp.id", "=", "wmpt.patient_id")
          .on("wmpt.target_group_id", "=", targetGroupId)
          .on("wmpt.microplanning_id", "in", microplanningIds)
          .on("wmpt.deleted_at", "is", null)
      )
      .where("wmpt.reff_id", "=", villageId)
      .where("wmpt.reff_type", "=", "village")
      .where("wmpt.deleted_at", "is", null)
      .select([
        "wp.id as target_id",
        "wp.birth_date as date_of_birth",
        "wp.gender",
        "wmpt.target_group_id",
      ])
      .execute()
  }

  async getTargetsByReferenceId(
    c: Context,
    referenceId: number,
    targetGroupId: number,
    microplanningId: number,
    type: "location" | "entity"
  ) {
    return await c.var.trx
      .selectFrom("ws_patients as wp")
      .innerJoin(
        "ws_microplanning_patient_targets as wmpt",
        "wmpt.patient_id",
        "wp.id"
      )
      .select([
        "wp.id",
        "wp.nik",
        "wp.birth_date as date_of_birth",
        "wp.gender",
        "wmpt.target_group_id",
      ])
      .where("wmpt.deleted_at", "is", null)
      .where("wmpt.microplanning_id", "=", microplanningId)
      .where("wmpt.target_group_id", "=", targetGroupId)
      .$if(type === "location", (q) =>
        q
          .where("wmpt.reff_id", "=", referenceId)
          .where("wmpt.reff_type", "=", "village")
      )
      .$if(type === "entity", (q) =>
        q
          .where("wmpt.reff_id", "=", referenceId)
          .where("wmpt.reff_type", "=", "school")
      )
      .execute()
  }

  async getMaterialAbsoluteTargetFromConfig(
    c: Context,
    mpProgramConfigIds: number[]
  ) {
    if (mpProgramConfigIds.length === 0) return []
    return await c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin("ws_materials as m", "mc.material_id", "m.id")
      .innerJoin("target_groups as tg", "mc.target_group_id", "tg.id")
      .select([
        "mc.id as material_target_id",
        "m.id as material_id",
        "m.name as material_name",
        "mc.target_group_id",
        "tg.title as target_group_title",
        "mc.start_ideal_days",
      ])
      .where("mc.type", "=", "immunization")
      .where("mc.mp_program_config_id", "in", mpProgramConfigIds)
      .where("mc.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .where("tg.deleted_at", "is", null)
      .execute()
  }

  async getImmunizationMaterialTargetsWithDoseFromConfig(c: Context) {
    const materialTargets = await c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin("ws_materials as m", "mc.material_id", "m.id")
      .select([
        "mc.id as mt_id",
        "m.id as material_id",
        "m.name as material_name",
        "mc.start_ideal_days",
        "mc.end_ideal_days",
        "mc.parent_id",
        "mc.category",
      ])
      .where("mc.type", "=", "immunization")
      .where("mc.target_group_id", "!=", 9)
      .where("mc.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .orderBy("mc.start_ideal_days", "asc")
      .execute()

    const getBaseName = (target: (typeof materialTargets)[0]): string =>
      target.material_name
        .split("@")[0]
        ?.replaceAll(/\s*\([^)]*\)/g, "")
        .trim() ?? ""

    const doseKeyToFormattedName = new Map<string, string>()
    const seenDoses = new Set<string>()
    const uniqueTargets: typeof materialTargets = []
    for (const target of materialTargets) {
      const doseKey = `${target.material_id}-${target.start_ideal_days}`
      if (!seenDoses.has(doseKey)) {
        seenDoses.add(doseKey)
        uniqueTargets.push(target)
      }
    }

    const doseCountPerVaccine = new Map<string, number>()
    for (const target of uniqueTargets) {
      const baseName = getBaseName(target)
      doseCountPerVaccine.set(
        baseName,
        (doseCountPerVaccine.get(baseName) ?? 0) + 1
      )
    }

    const doseAssigned = new Map<string, number>()
    for (const target of uniqueTargets) {
      const baseName = getBaseName(target)
      const totalDoses = doseCountPerVaccine.get(baseName) ?? 1
      const currentDose = (doseAssigned.get(baseName) ?? 0) + 1
      doseAssigned.set(baseName, currentDose)
      const formattedName =
        totalDoses > 1 ? `${baseName} ${currentDose}` : baseName
      const doseKey = `${target.material_id}-${target.start_ideal_days}`
      doseKeyToFormattedName.set(doseKey, formattedName)
    }

    // Return ALL entries (including duplicates from multi-year configs),
    // each mapped to the correct formatted_name for its dose position
    return materialTargets.map((target) => {
      const baseName = getBaseName(target)
      const doseKey = `${target.material_id}-${target.start_ideal_days}`
      const formattedName = doseKeyToFormattedName.get(doseKey) ?? baseName
      const dose = Number.parseInt(formattedName.split(" ").pop() ?? "1") ?? 1

      return {
        mt_id: target.mt_id,
        material_id: target.material_id,
        material_name: target.material_name,
        base_name: baseName,
        dose,
        formatted_name: formattedName,
        start_ideal_days: target.start_ideal_days,
        end_ideal_days: target.end_ideal_days,
        parent_id: target.parent_id,
        category: target.category,
      }
    })
  }

  async getMaterialConsumptionsFromConfig(
    c: Context,
    locationIds: number[],
    locationType: LocationType,
    queries: TargetConsumptionQueries,
    mpProgramConfigIds: number[]
  ) {
    if (mpProgramConfigIds.length === 0) return []
    const columnMap = {
      province: "residential_province_id" as const,
      city: "residential_regency_id" as const,
      district: "residential_subdistrict_id" as const,
      village: "residential_village_id" as const,
    }

    const patientColumn = columnMap[locationType]

    return await c.var.trx
      .selectFrom("ws_patient_immunizations as pi")
      .innerJoin("ws_patients as p", "pi.patient_id", "p.id")
      .innerJoin(
        "ws_patient_immunization_details as pid",
        "pid.patient_immunization_id",
        "pi.id"
      )
      .innerJoin(
        "ws_mp_material_target_config as mc",
        "mc.id",
        "pid.material_target_id"
      )
      .innerJoin("ws_materials as m", "m.id", "mc.material_id")
      .leftJoin("ws_materials as m_parent", "m.parent_id", "m_parent.id")
      .select((eb) => [
        `p.${patientColumn}` as any,
        "mc.id as material_target_id",
        eb
          .case()
          .when("m.parent_id", "is not", null)
          .then(eb.ref("m_parent.name"))
          .else(eb.ref("m.name"))
          .end()
          .as("material_base_name"),
        "m.name as material_name",
        eb.fn.count("pid.id").as("total"),
      ])
      .where("pi.deleted_at", "is", null)
      .where("p.deleted_at", "is", null)
      .where("pid.deleted_at", "is", null)
      .where("mc.type", "=", "immunization")
      .where("mc.mp_program_config_id", "in", mpProgramConfigIds)
      .where("pid.last_status", "=", 2)
      .where("pid.last_is_given", "=", 1)
      .where("mc.deleted_at", "is", null)
      .where("m.deleted_at", "is", null)
      .where(`p.${patientColumn}` as any, "in", locationIds)
      .$if(queries.gender !== undefined, (qb) =>
        qb.where("p.gender", "=", queries.gender)
      )
      .$if(queries.start_date !== undefined, (qb) =>
        qb.where("pid.injection_date", ">=", queries.start_date! as any)
      )
      .$if(queries.end_date !== undefined, (qb) =>
        qb.where("pid.injection_date", "<=", queries.end_date! as any)
      )
      .$if(
        queries.material_id !== undefined && queries.material_id.length > 0,
        (qb) => qb.where("m.global_id", "in", queries.material_id)
      )
      .$if(
        queries.batch_ids !== undefined && queries.batch_ids.length > 0,
        (qb) => qb.where("pid.batch_id", "in", queries.batch_ids)
      )
      .$if(
        queries.target_group !== undefined && queries.target_group.length > 0,
        (qb) => qb.where("pid.target_group_id", "in", queries.target_group)
      )
      .groupBy([`p.${patientColumn}`, "mc.id", "material_base_name", "m.name"])
      .execute()
  }

  async getPopulationByEntityAndYear(
    c: Context,
    entityId: number,
    year: number,
    integerIds: number[]
  ) {
    const populationData = await c.var.trx
      .selectFrom("populations as p")
      .innerJoin("target_groups as tg", "tg.id", "p.target_group_id")
      .select([
        "p.id as population_id",
        "p.entity_id",
        "p.target_group_id",
        "tg.title as target_group_name",
        "p.population_number",
        "p.year",
        "p.status",
        "p.updated_by",
        "p.updated_at",
      ])
      .where("p.entity_id", "=", entityId)
      .where("tg.id", "in", integerIds)
      .where("p.year", "=", year)
      .where("p.deleted_at", "is", null)
      .orderBy("p.target_group_id", "asc")
      .execute()

    return populationData
  }

  async getMaterialTargetProvinceCoverage(
    c: Context,
    mpProgramConfigIds: number[]
  ) {
    if (mpProgramConfigIds.length === 0) return []
    return await c.var.trx
      .selectFrom("ws_mp_material_target_config as mc")
      .innerJoin(
        "ws_mp_province_coverage as cov",
        "cov.mp_material_target_config_id",
        "mc.id"
      )
      .select(["mc.id as material_target_id", "cov.province_id"])
      .where("mc.mp_program_config_id", "in", mpProgramConfigIds)
      .where("mc.deleted_at", "is", null)
      .where("cov.deleted_at", "is", null)
      .execute()
  }

  async isSchoolAlreadyAssigned(
    c: Context,
    schoolId: number,
    year: number,
    excludeMicroplanningId?: number
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_schools")
      .select("entity_name")
      .where("school_id", "=", schoolId)
      .where("year", "=", year)
      .where("is_assigned", "=", 1)

    if (excludeMicroplanningId !== undefined) {
      query = query.where("microplanning_id", "!=", excludeMicroplanningId)
    }

    const result = await query.executeTakeFirst()
    return result
  }

  async isVillageAlreadyAssigned(
    c: Context,
    villageId: number,
    year: number,
    excludeMicroplanningId?: number
  ) {
    let query = c.var.trx
      .selectFrom("ws_microplanning_villages")
      .select("entity_name")
      .where("village_id", "=", villageId)
      .where("year", "=", year)
      .where("is_assigned", "=", 1)

    if (excludeMicroplanningId !== undefined) {
      query = query.where("microplanning_id", "!=", excludeMicroplanningId)
    }

    const result = await query.executeTakeFirst()
    return result
  }

  async getAbsoluteTargetsForVillage(
    c: Context,
    locationIds: number[],
    queries: TargetConsumptionQueries
  ) {
    if (locationIds.length === 0) return []

    const startYear = queries.start_date
      ? new Date(queries.start_date).getFullYear()
      : undefined
    const endYear = queries.end_date
      ? new Date(queries.end_date).getFullYear()
      : undefined

    const villageIdExpr = sql<number>`CASE WHEN wmat.reff_type = 'village' THEN wmat.reff_id WHEN wmat.reff_type = 'school' THEN e_school.village_id END`

    return await c.var.trx
      .selectFrom("ws_microplan_absolute_target as wmat")
      .innerJoin("ws_microplanning as wm", "wmat.microplan_id", "wm.id")
      .leftJoin("ws_entities as e", "wm.entity_id", "e.id")
      .leftJoin("ws_entities as e_school", (join) =>
        join
          .onRef("e_school.id", "=", "wmat.reff_id")
          .on(sql`wmat.reff_type = 'school'` as any)
      )
      .innerJoin("target_groups as tg", "wmat.target_group_id", "tg.id")
      .select((eb) => [
        villageIdExpr.as("village_id"),
        "e.province_id as entity_province_id",
        "tg.id as material_target_id",
        "tg.title as material_name",
        eb.fn.sum("wmat.qty").as("total"),
      ])
      .where("wmat.deleted_at", "is", null)
      .where("wm.deleted_at", "is", null)
      .where("wm.status", "=", 1)
      .where("tg.deleted_at", "is", null)
      .where((eb) =>
        eb.or([
          eb.and([
            eb("wmat.reff_type" as any, "=", "village" as any),
            eb("wmat.reff_id" as any, "in", locationIds),
          ]),
          eb.and([
            eb("wmat.reff_type" as any, "=", "school" as any),
            eb("e_school.village_id" as any, "in", locationIds),
          ]),
        ])
      )
      .$if(startYear !== undefined, (qb) =>
        qb.where("wm.year", ">=", startYear! as any)
      )
      .$if(endYear !== undefined, (qb) =>
        qb.where("wm.year", "<=", endYear! as any)
      )
      .$if(
        queries.target_group !== undefined && queries.target_group.length > 0,
        (qb) => qb.where("tg.id", "in", queries.target_group)
      )
      .groupBy([villageIdExpr as any, "e.province_id", "tg.id", "tg.title"])
      .execute()
  }
}
