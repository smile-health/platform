import { DB } from "@/common/infrastructure/database/types/db.js"
import { Context } from "@smile/lib/types/context.js"
import {
  GetProtocolQueries,
  VaccineResult,
  TypeItem,
  MethodItem,
  ProtocolMaterialActivityBody,
  GetVaccineSequenceQueries,
  GetVaccineSequenceV2Queries,
} from "./protocol.schema.js"
import { RawBuilder, sql } from "kysely"
import { doEncrypt } from "../transaction/utils/transaction.encryption.js"
import moment from "moment"

type VaccineRule = {
  previous_sequence: number
  before_sequence: number | null
  next_sequence: number
  prerequisite_qty: number | null
  sort: number
}

export class ProtocolRepository {
  async getListProtocol(
    c: Context<DB>,
    programId: number,
    param: GetProtocolQueries
  ) {
    const { page, paginate, keyword, status } = param
    const offset = (page - 1) * paginate

    let query = c.var.trx
      .selectFrom("protocols as p")
      .innerJoin("protocol_programs as pp", (eb) =>
        eb
          .onRef("pp.protocol_id", "=", "p.id")
          .on("pp.program_id", "=", programId)
      )

    if (keyword) query = query.where("p.name", "like", `%${keyword}%`)

    if (status !== undefined)
      query = query.where("p.status", "=", Number(status))

    return query
      .selectAll("p")
      .orderBy("p.id")
      .limit(paginate)
      .offset(offset)
      .execute()
  }

  async getTotalCountProtocol(
    c: Context<DB>,
    programId: number,
    param: GetProtocolQueries
  ) {
    const { keyword } = param
    let query = c.var.trx
      .selectFrom("protocols as p")
      .innerJoin("protocol_programs as pp", (eb) =>
        eb
          .onRef("pp.protocol_id", "=", "p.id")
          .on("pp.program_id", "=", programId)
      )

    if (keyword) query = query.where("p.name", "like", `%${keyword}%`)

    const total = await query
      .select((eb) => eb.fn.countAll().as("total"))
      .executeTakeFirst()
    return Number(total?.total) || 0
  }

  // ==========================================================
  // Transform vaccine sequences data
  // ==========================================================
  private transformVaccineData(c: Context<DB>, rows): VaccineResult | [] {
    if (!rows.length) return []

    const first = rows[0]
    const hasType = !!first.type_id
    const hasMethod = !!first.method_id

    const result: VaccineResult = {
      protocol: first.protocol_name || "",
      is_kipi: first.is_kipi,
      is_medical_history: first.is_medical_history,
      is_identity_type: first.is_identity_type,
      is_vaccine_type: hasType,
      is_vaccine_method: hasMethod,
      data: [],
    }

    const makeSequence = (r) => ({
      id: r.id,
      title: c.var.t(r.title),
      min: r.min,
      max: r.max,
      ideal_age: r.ideal_age,
      max_age: r.max_age,
      active_duration: r.active_duration,
    })

    const typeMap = new Map<number, TypeItem>()
    for (const r of rows) {
      if (!typeMap.has(r.type_id)) {
        typeMap.set(r.type_id, {
          id: r.type_id,
          title: c.var.t(r.type_title),
          methods: [],
          _methodMap: new Map<number, MethodItem>(),
        })
        result.data.push(typeMap.get(r.type_id)!)
      }

      const type = typeMap.get(r.type_id)!
      const mMap = type._methodMap!
      if (!mMap.has(r.method_id)) {
        mMap.set(r.method_id, {
          id: r.method_id,
          title: c.var.t(r.method_title),
          is_multi_patient: r.is_multi_patient,
          sequences: [],
        })
        type.methods.push(mMap.get(r.method_id)!)
      }

      mMap.get(r.method_id)!.sequences.push(makeSequence(r))
    }

    result.data.forEach((t) => delete t._methodMap)
    return result
  }

  async getVaccineSequences(
    c: Context<DB>,
    protocolId: number,
    param: GetVaccineSequenceQueries
  ) {
    const { keyword, nik } = param
    let query = c.var.trx
      .selectFrom("ws_vaccine_sequences")
      .innerJoin(
        "protocols",
        "ws_vaccine_sequences.protocol_id",
        "protocols.id"
      )
      .leftJoin(
        "vaccine_methods",
        "ws_vaccine_sequences.method_id",
        "vaccine_methods.id"
      )
      .leftJoin(
        "vaccine_types",
        "ws_vaccine_sequences.type_id",
        "vaccine_types.id"
      )
      .select([
        "ws_vaccine_sequences.id as id",
        "ws_vaccine_sequences.title as title",
        "protocols.name as protocol_name",
        "ws_vaccine_sequences.type_id as type_id",
        "vaccine_types.title as type_title",
        "ws_vaccine_sequences.method_id as method_id",
        "vaccine_methods.title as method_title",
        "vaccine_methods.is_multi_patient as is_multi_patient",
        "ws_vaccine_sequences.min as min",
        "ws_vaccine_sequences.max as max",
        "ws_vaccine_sequences.ideal_age as ideal_age",
        "ws_vaccine_sequences.max_age as max_age",
        "ws_vaccine_sequences.active_duration as active_duration",
        "protocols.is_kipi as is_kipi",
        "protocols.is_medical_history as is_medical_history",
        "protocols.is_identity_type as is_identity_type",
      ])
      .where("protocol_id", "=", protocolId)

    if (keyword)
      query = query.where("ws_vaccine_sequences.title", "like", `%${keyword}%`)

    if (nik) {
      const sequenceIds = await this.getSequenceIdsByNik(c, nik, protocolId)
      if (sequenceIds.length > 0)
        query = query.where("ws_vaccine_sequences.id", "in", sequenceIds)
    }

    const rows = await query
      .orderBy("ws_vaccine_sequences.sort", "asc")
      .execute()
    return this.transformVaccineData(c, rows)
  }

  async getVaccineSequencesV2(
    c: Context<DB>,
    protocolId: number,
    param: GetVaccineSequenceV2Queries
  ) {
    const { nik, keyword } = param

    let normalIds: number[] = []
    const pepInsertionIds = new Set<number>()
    let hasIdentityFilter = false
    let patientTypeId: number | null = null
    let patientMethodId: number | null = null

    if (nik) {
      hasIdentityFilter = true
      const result = await this.getSequenceIdsByIdentityV2(c, nik, protocolId)
      normalIds = result.normalIds
      result.pepInsertionIds.forEach((id) => pepInsertionIds.add(id))
      patientTypeId = result.typeId ?? null
      patientMethodId = result.methodId ?? null
    }

    const allValidIds = hasIdentityFilter
      ? [...new Set([...normalIds, ...Array.from(pepInsertionIds)])]
      : null

    if (allValidIds !== null && allValidIds.length === 0) return []

    let query = c.var.trx
      .selectFrom("ws_vaccine_sequences")
      .innerJoin(
        "protocols",
        "ws_vaccine_sequences.protocol_id",
        "protocols.id"
      )
      .leftJoin(
        "vaccine_methods",
        "ws_vaccine_sequences.method_id",
        "vaccine_methods.id"
      )
      .leftJoin(
        "vaccine_types",
        "ws_vaccine_sequences.type_id",
        "vaccine_types.id"
      )
      .select([
        "ws_vaccine_sequences.id as id",
        "ws_vaccine_sequences.title as title",
        "protocols.name as protocol_name",
        "ws_vaccine_sequences.type_id as type_id",
        "vaccine_types.title as type_title",
        "ws_vaccine_sequences.method_id as method_id",
        "vaccine_methods.title as method_title",
        "vaccine_methods.is_multi_patient as is_multi_patient",
        "ws_vaccine_sequences.min as min",
        "ws_vaccine_sequences.max as max",
        "ws_vaccine_sequences.ideal_age as ideal_age",
        "ws_vaccine_sequences.max_age as max_age",
        "ws_vaccine_sequences.active_duration as active_duration",
        "protocols.is_kipi as is_kipi",
        "protocols.is_medical_history as is_medical_history",
        "protocols.is_identity_type as is_identity_type",
      ])
      .where("protocol_id", "=", protocolId)

    if (keyword)
      query = query.where("ws_vaccine_sequences.title", "like", `%${keyword}%`)

    if (allValidIds !== null)
      query = query.where("ws_vaccine_sequences.id", "in", allValidIds)

    // Filter to only the type and method the patient has been vaccinated with
    if (patientTypeId !== null)
      query = query.where("ws_vaccine_sequences.type_id", "=", patientTypeId)
    if (patientMethodId !== null)
      query = query.where("ws_vaccine_sequences.method_id", "=", patientMethodId)

    const rows = await query
      .orderBy("ws_vaccine_sequences.sort", "asc")
      .execute()

    return this.transformVaccineDataV2(c, rows, pepInsertionIds)
  }

  private transformVaccineDataV2(
    c: Context<DB>,
    rows: any[],
    pepInsertionIds: Set<number>
  ): VaccineResult | [] {
    if (!rows.length) return []

    const first = rows[0]

    const result: VaccineResult = {
      protocol: first.protocol_name || "",
      is_kipi: first.is_kipi,
      is_medical_history: first.is_medical_history,
      is_identity_type: first.is_identity_type,
      is_vaccine_type: !!first.type_id,
      is_vaccine_method: !!first.method_id,
      data: [],
    }

    const makeSequence = (r: any) => ({
      id: r.id,
      title: c.var.t(r.title),
      min: r.min,
      max: r.max,
      ideal_age: r.ideal_age,
      max_age: r.max_age,
      active_duration: r.active_duration,
      is_pep_insertion: pepInsertionIds.has(r.id),
    })

    const typeMap = new Map<number, TypeItem>()
    for (const r of rows) {
      if (!typeMap.has(r.type_id)) {
        typeMap.set(r.type_id, {
          id: r.type_id,
          title: c.var.t(r.type_title),
          methods: [],
          _methodMap: new Map<number, MethodItem>(),
        })
        result.data.push(typeMap.get(r.type_id)!)
      }

      const type = typeMap.get(r.type_id)!
      const mMap = type._methodMap!
      if (!mMap.has(r.method_id)) {
        mMap.set(r.method_id, {
          id: r.method_id,
          title: c.var.t(r.method_title),
          is_multi_patient: r.is_multi_patient,
          sequences: [],
        })
        type.methods.push(mMap.get(r.method_id)!)
      }

      mMap.get(r.method_id)!.sequences.push(makeSequence(r))
    }

    result.data.forEach((t) => delete t._methodMap)
    return result
  }

  private async getSequenceIdsByIdentityV2(
    c: Context<DB>,
    identityNumber: string,
    protocolId: number
  ): Promise<{ normalIds: number[]; pepInsertionIds: Set<number>; typeId?: number; methodId?: number }> {
    const patient = await c.var.trx
      .selectFrom("ws_patients")
      .select(["id"])
      .where("nik", "=", doEncrypt(identityNumber))
      .executeTakeFirst()

    if (!patient) {
      return { normalIds: await this.getDay0SequenceIds(c, protocolId), pepInsertionIds: new Set() }
    }

    // Fetch last consumption, rules, and Day 0 consumption records in parallel
    const [consumption, rules, day0Consumptions] = await Promise.all([
      c.var.trx
        .selectFrom("ws_consumptions as wc")
        .innerJoin("ws_vaccine_sequences as wvs", "wvs.id", "wc.vaccine_sequence_id")
        .select([
          "wc.actual_qty as actual_qty",
          "wc.actual_date as actual_date",
          "wc.vaccine_sequence_id as vaccine_sequence_id",
          "wvs.active_duration as active_duration",
          "wvs.type_id as type_id",
          "wvs.method_id as method_id",
        ])
        .where("wc.patient_id", "=", patient.id)
        .where("wc.vaccine_sequence_id", "is not", null)
        .where("wc.protocol_id", "=", protocolId)
        .where("wc.deleted_at", "is", null)
        .orderBy("wvs.sort", "desc")
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_vaccine_rules as r")
        .innerJoin("ws_vaccine_sequences as s", "s.id", "r.next_sequence")
        .select([
          "r.previous_sequence",
          "r.before_sequence",
          "r.next_sequence",
          "r.prerequisite_qty",
          "s.sort as sort",
        ])
        .where("r.protocol_id", "=", protocolId)
        .orderBy("s.sort", "asc")
        .execute(),
      // Check Day 0 consumptions: only those with actual_qty < max are PEP insertion candidates
      c.var.trx
        .selectFrom("ws_consumptions as wc")
        .innerJoin("ws_vaccine_sequences as wvs", "wvs.id", "wc.vaccine_sequence_id")
        .select(["wc.vaccine_sequence_id", "wc.actual_qty", "wvs.max"])
        .where("wc.patient_id", "=", patient.id)
        .where("wc.protocol_id", "=", protocolId)
        .where("wc.deleted_at", "is", null)
        .where("wvs.is_start_sequence", "=", 1)
        .execute(),
    ])

    // No vaccination history → show Day 0 to start the protocol
    if (!consumption) {
      return { normalIds: await this.getDay0SequenceIds(c, protocolId), pepInsertionIds: new Set() }
    }

    // Last sequence expired → nothing available
    const daysDiff = moment()
      .startOf("day")
      .diff(moment(consumption.actual_date).startOf("day"), "days")
    if (
      consumption.active_duration &&
      daysDiff > Number(consumption.active_duration)
    ) {
      return { normalIds: [], pepInsertionIds: new Set() }
    }

    // Fetch the sequence before the latest one (needed for DFS branch context)
    const oldSequence = await c.var.trx
      .selectFrom("ws_consumptions")
      .select(["vaccine_sequence_id"])
      .where("patient_id", "=", patient.id)
      .where("vaccine_sequence_id", "!=", consumption.vaccine_sequence_id)
      .where("protocol_id", "=", protocolId)
      .where("deleted_at", "is", null)
      .orderBy("actual_date", "desc")
      .executeTakeFirst()

    // Find only the immediate next sequences (1 level from current position)
    const currentSeq = consumption.vaccine_sequence_id || 0
    const beforeSeq = oldSequence?.vaccine_sequence_id ?? null

    const result = new Set<number>()
    for (const r of rules as VaccineRule[]) {
      if (r.previous_sequence !== currentSeq) continue
      if (beforeSeq !== null && r.before_sequence !== null && r.before_sequence !== beforeSeq) continue
      if (r.prerequisite_qty !== null && r.prerequisite_qty !== consumption.actual_qty) continue
      result.add(Number(r.next_sequence))
    }

    const typeId = consumption.type_id ?? undefined
    const methodId = consumption.method_id ?? undefined

    // No next sequences → vaccination is complete, nothing more to show
    if (result.size === 0) return { normalIds: [], pepInsertionIds: new Set(), typeId, methodId }

    // Day 0 is a PEP insertion candidate only while actual_qty < max (still has room)
    const pepInsertionIds = new Set<number>()
    for (const con of day0Consumptions) {
      if (con.max == null || Number(con.actual_qty ?? 0) < Number(con.max)) {
        pepInsertionIds.add(con.vaccine_sequence_id!)
      }
    }

    return { normalIds: Array.from(result), pepInsertionIds, typeId, methodId }
  }

  private async getDay0SequenceIds(
    c: Context<DB>,
    protocolId: number
  ): Promise<number[]> {
    const rows = await c.var.trx
      .selectFrom("ws_vaccine_sequences")
      .select(["id"])
      .where("protocol_id", "=", protocolId)
      .where("is_start_sequence", "=", 1)
      .execute()
    return rows.map((r) => r.id)
  }

  async getSequenceIdsByNik(c: Context<DB>, nik: string, protocolId: number) {
    /* =====================
     * 1. PRECONDITION LOGIC
     * ===================== */

    const nikEncrypted = doEncrypt(nik)

    const patient = await c.var.trx
      .selectFrom("ws_patients")
      .select(["id"])
      .where("nik", "=", nikEncrypted)
      .executeTakeFirst()

    if (!patient) return []

    const consumption = await c.var.trx
      .selectFrom("ws_consumptions as wc")
      .innerJoin(
        "ws_vaccine_sequences as wvs",
        "wvs.id",
        "wc.vaccine_sequence_id"
      )
      .select([
        "wvs.method_id as method_id",
        "wvs.type_id as type_id",
        "wc.actual_qty as actual_qty",
        "wc.actual_date as actual_date",
        "wc.vaccine_sequence_id as vaccine_sequence_id",
        "wvs.active_duration as active_duration",
      ])
      .where("wc.patient_id", "=", patient.id)
      .where("wc.vaccine_sequence_id", "is not", null)
      .where("wc.protocol_id", "=", protocolId)
      .where("wc.deleted_at", "is", null)
      .orderBy("wvs.sort", "desc")
      .executeTakeFirst()

    if (!consumption) return []

    const daysDiff = moment()
      .startOf("day")
      .diff(moment(consumption.actual_date).startOf("day"), "days")

    if (
      consumption.active_duration &&
      daysDiff > Number(consumption.active_duration)
    ) {
      return []
    }

    const isFlowPepIntramuscullar2128 = await this.checkPepIntramuscullar2128(
      c,
      patient.id,
      protocolId,
      consumption.method_id!,
      consumption.type_id!,
      consumption.vaccine_sequence_id!
    )

    const oldSequence = await c.var.trx
      .selectFrom("ws_consumptions")
      .select(["vaccine_sequence_id"])
      .where("patient_id", "=", patient.id)
      .where("vaccine_sequence_id", "!=", consumption.vaccine_sequence_id)
      .where("protocol_id", "=", protocolId)
      .where("deleted_at", "is", null)
      .$if(
        isFlowPepIntramuscullar2128 === "ZAGREB",
        (qb) => qb.where("vaccine_sequence_id", "!=", 15) // exclude sequence day 3 for pasca-pajanan intramuscular
      )
      .orderBy("actual_date", "desc")
      .executeTakeFirst()

    const initialBefore = oldSequence?.vaccine_sequence_id ?? null

    /* =====================
     * 2. LOAD RULES ONCE
     * ===================== */

    const rules = (await c.var.trx
      .selectFrom("ws_vaccine_rules as r")
      .innerJoin("ws_vaccine_sequences as s", "s.id", "r.next_sequence")
      .select([
        "r.previous_sequence",
        "r.before_sequence",
        "r.next_sequence",
        "r.prerequisite_qty",
        "s.sort as sort",
      ])
      .where("r.protocol_id", "=", protocolId)
      .orderBy("s.sort", "asc")
      .execute()) as VaccineRule[]

    const ruleMap = new Map<number, VaccineRule[]>()

    for (const r of rules) {
      if (!ruleMap.has(r.previous_sequence)) {
        ruleMap.set(r.previous_sequence, [])
      }
      ruleMap.get(r.previous_sequence)!.push(r)
    }

    /* =====================
     * 3. DFS TRAVERSAL
     * ===================== */

    const result = new Set<number>() // avoid duplicates

    type StackItem = {
      prevSeq: number
      beforeSeq: number | null
      step: number
      visited: Set<number>
    }

    const stack: StackItem[] = [
      {
        prevSeq: consumption.vaccine_sequence_id || 0,
        beforeSeq: initialBefore,
        step: 0,
        visited: new Set<number>(),
      },
    ]

    while (stack.length) {
      const { prevSeq, beforeSeq, step, visited } = stack.pop()!

      if (visited.has(prevSeq)) continue

      const nextVisited = new Set(visited)
      nextVisited.add(prevSeq)

      const candidates = ruleMap.get(prevSeq)
      if (!candidates) continue

      for (const rule of candidates) {
        // before_sequence condition
        if (
          beforeSeq !== null &&
          rule.before_sequence !== null &&
          rule.before_sequence !== beforeSeq
        ) {
          continue
        }

        // prerequisite_qty only at first step
        if (
          step === 0 &&
          rule.prerequisite_qty !== null &&
          rule.prerequisite_qty !== consumption.actual_qty
        ) {
          continue
        }

        const nextSeq = Number(rule.next_sequence)
        result.add(nextSeq)

        stack.push({
          prevSeq: nextSeq,
          beforeSeq: prevSeq,
          step: step + 1,
          visited: nextVisited,
        })
      }
    }

    /* =====================
     * 4. Sequence Jumped Logic (Rabies Protocol Only)
     * ===================== */

    const jumpedSequences = await this.getJumpedSequenceRabies(
      c,
      patient.id,
      protocolId,
      isFlowPepIntramuscullar2128
    )
    jumpedSequences.forEach((js) => result.add(js))

    return Array.from(result)
  }

  async checkPepIntramuscullar2128(
    c: Context<DB>,
    patientId: number,
    protocolId: number,
    methodId: number,
    typeId: number,
    sequenceId: number
  ): Promise<string> {
    const PASCA_PAJANAN_METHOD_ID = 1
    const INTRAMUSCULAR_TYPE_ID = 2
    const SEQUENCE_ID_INTRAMUSCULAR_DAY_0 = 3
    const SEQUENCE_ID_INTRAMUSCULAR_DAY_3 = 15
    const SEQUENCE_ID_INTRAMUSCULAR_DAY_7 = 4
    const SEQUENCE_ID_INTRAMUSCULAR_DAY_14 = 16

    if (
      protocolId > 1 ||
      methodId !== PASCA_PAJANAN_METHOD_ID ||
      typeId !== INTRAMUSCULAR_TYPE_ID ||
      sequenceId !== SEQUENCE_ID_INTRAMUSCULAR_DAY_7
    )
      return "NORMAL"

    const [isExist, isDay3And14Exist] = await Promise.all([
      c.var.trx
        .selectFrom("ws_consumptions as wc")
        .leftJoin("ws_transactions as wt", "wt.id", "wc.transaction_id")
        .select(["wt.change_qty"])
        .where("wc.patient_id", "=", patientId)
        .where("wc.protocol_id", "=", protocolId)
        .where("wc.vaccine_sequence_id", "=", SEQUENCE_ID_INTRAMUSCULAR_DAY_0)
        .where("wt.change_qty", "<", -1)
        .where("wc.deleted_at", "is", null)
        .executeTakeFirst(),
      c.var.trx
        .selectFrom("ws_consumptions as wc")
        .leftJoin("ws_transactions as wt", "wt.id", "wc.transaction_id")
        .select(["wt.change_qty"])
        .where("wc.patient_id", "=", patientId)
        .where("wc.protocol_id", "=", protocolId)
        .where("wc.vaccine_sequence_id", "in", [
          SEQUENCE_ID_INTRAMUSCULAR_DAY_3,
          SEQUENCE_ID_INTRAMUSCULAR_DAY_14,
        ])
        .where("wt.change_qty", "<", 0)
        .where("wc.deleted_at", "is", null)
        .executeTakeFirst(),
    ])

    if (isDay3And14Exist) return "ESSEN"

    return isExist ? "ZAGREB" : "ESSEN"
  }

  async getJumpedSequenceRabies(
    c: Context<DB>,
    patientId: number,
    protocolId: number,
    isFlowPepIntramuscullar2128: string
  ): Promise<number[]> {
    if (protocolId !== 1) return [] // only for rabies protocol
    const jumpedSequence = await c.var.trx
      .selectFrom("ws_consumptions as wc")
      .select(["wc.vaccine_sequence_id"])
      .leftJoin("ws_transactions as wt", "wt.id", "wc.transaction_id")
      .where("wc.patient_id", "=", patientId)
      .where("wc.protocol_id", "=", protocolId)
      .where("wc.deleted_at", "is", null)
      .where("wt.change_qty", "=", 0)
      .$if(isFlowPepIntramuscullar2128 === "ZAGREB", (qb) =>
        qb.where("vaccine_sequence_id", "!=", 15)
      )
      .orderBy("wc.vaccine_sequence_id", "asc")
      .execute()

    const jumpedSequenceIds = jumpedSequence
      .map((j) => j.vaccine_sequence_id)
      .filter((id): id is number => id !== null)

    return jumpedSequenceIds
  }

  async setProtocolToMaterialActivities(
    c: Context<DB>,
    body: ProtocolMaterialActivityBody,
    userId?: number
  ) {
    const { protocol_id, material_activities } = body
    if (!material_activities?.length) return

    const pairs = sql.join(
      material_activities.map((m) => sql`(${m.material_id}, ${m.activity_id})`)
    )

    await c.var.trx
      .updateTable("ws_material_activities")
      .set({ protocol_id, updated_at: sql`NOW()`, updated_by: userId || null })
      .where(sql`(material_id, activity_id)`, "in", sql`(${pairs})`)
      .execute()

    return this.getDataMaterialActivitiesLastUpdated(c, protocol_id, pairs)
  }

  async getDataMaterialActivitiesLastUpdated(
    c: Context<DB>,
    protocolId: number,
    materialActivities?: RawBuilder<unknown>
  ) {
    return c.var.trx
      .selectFrom("ws_material_activities as wma")
      .innerJoin("ws_materials as wm", "wma.material_id", "wm.id")
      .innerJoin("ws_activities as wa", "wma.activity_id", "wa.id")
      .innerJoin("protocols as wp", "wma.protocol_id", "wp.id")
      .select([
        "wma.id as id",
        "wma.protocol_id as protocol_id",
        "wp.name as protocol_name",
        "wma.material_id as material_id",
        "wm.name as material_name",
        "wma.activity_id as activity_id",
        "wa.name as activity_name",
        "wma.updated_at as updated_at",
      ])
      .where("wma.protocol_id", "=", protocolId)
      .where("wma.deleted_at", "is", null)
      .where(
        sql`(wma.material_id, wma.activity_id)`,
        "in",
        sql`(${materialActivities})`
      )
      .execute()
  }

  async getMaterialActivitiesByProtocolId(
    c: Context<DB>,
    programId: number,
    protocolId: number,
    params: GetProtocolQueries
  ) {
    const { page, paginate, keyword } = params
    const offset = (page - 1) * paginate
    let query = c.var.trx
      .selectFrom("ws_material_activities as wma")
      .innerJoin("ws_materials as wm", "wma.material_id", "wm.id")
      .innerJoin("ws_activities as wa", "wma.activity_id", "wa.id")
      .innerJoin("protocols as wp", "wma.protocol_id", "wp.id")
      .leftJoin("ws_users as cu", "wma.updated_by", "cu.id")
      .select([
        "wma.id as id",
        "wma.protocol_id as protocol_id",
        "wp.name as protocol_name",
        "wma.material_id as material_id",
        "wm.name as material_name",
        "wma.activity_id as activity_id",
        "wa.name as activity_name",
        "wma.updated_at as updated_at",
        "wma.created_at as created_at",
        "cu.firstname as updated_by_firstname",
        "cu.lastname as updated_by_lastname",
      ])
      .where("wma.protocol_id", "=", protocolId)
      .where("wa.program_id", "=", programId)
      .where("wma.deleted_at", "is", null)

    if (keyword) query = query.where("wm.name", "like", `%${keyword}%`)

    query = query
      .limit(paginate)
      .offset(offset)
      .orderBy("wma.updated_at", "desc")

    const [data, count] = await Promise.all([
      query.execute(),
      query
        .clearSelect()
        .clearOrderBy()
        .select((eb) => eb.fn.countAll().as("total"))
        .executeTakeFirstOrThrow(),
    ])

    return {
      data,
      total: count ? Number(count.total) : 0,
    }
  }

  async getMaterialActivityById(c: Context<DB>, id: number) {
    return await c.var.trx
      .selectFrom("ws_material_activities as wma")
      .innerJoin("ws_materials as wm", "wma.material_id", "wm.id")
      .innerJoin("ws_activities as wa", "wma.activity_id", "wa.id")
      .select([
        "wma.id as id",
        "wma.protocol_id as protocol_id",
        "wma.material_id as material_id",
        "wm.name as material_name",
        "wma.activity_id as activity_id",
        "wa.name as activity_name",
        "wma.updated_at as updated_at",
        "wma.created_at as created_at",
      ])
      .where("wma.id", "=", id)
      .where("wma.deleted_at", "is", null)
      .executeTakeFirst()
  }

  async deleteProtocolFromMaterialActivity(
    c: Context<DB>,
    id: number,
    userId: number
  ) {
    await c.var.trx
      .updateTable("ws_material_activities")
      .set({ protocol_id: null, updated_at: sql`NOW()`, updated_by: userId })
      .where("id", "=", id)
      .execute()

    return await this.getMaterialActivityById(c, id)
  }

  async getProtocolById(c: Context<DB>, id: number) {
    return await c.var.trx
      .selectFrom("protocols")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst()
  }

  async updateStatusProtocol(c: Context<DB>, id: number, status: number) {
    await c.var.trx
      .updateTable("protocols")
      .set({ status, updated_at: sql`NOW()` })
      .where("id", "=", id)
      .execute()

    return await this.getProtocolById(c, id)
  }
}
