import { ActivityRepository } from "@/modules/activity/activity.repository.js"
import { EntityActivityRepository } from "@/modules/entity-activity/entity-activity.repository.js"
import { ValidationError } from "@smile/lib/error.js"
import { associate, getDefaultNumber } from "@smile/lib/utils.js"
import { conditionsMessage } from "@smile/lib/zod.js"
import { Context } from "hono"
import moment from "moment"
import { RefinementCtx, z } from "zod"
import { TransactionRepository } from "../transaction.repository.js"
import { TransactionErrorHandler } from "../utils/transaction.error.js"
import { TransactionValidator } from "../utils/transaction.validator.js"
import {
  conditionsMessageWithData,
  formatErrorsWithData,
} from "../utils/transaction.zod.js"
import { ConsumptionRepository } from "./consumption.repository.js"
import {
  ConsumptionRequest,
  ConsumptionRequestSchema,
  PatientRequest,
} from "./consumption.schema.js"

type Stock = {
  id: number
  material_id: number | null
  qty: number | null
  open_vial_qty: number | null
  allocated_qty: number | null
  batch_id: number | null
}

type Customer = Awaited<
  ReturnType<TransactionRepository["findWsEntityById"]>
>

type Protocol = Awaited<ReturnType<ConsumptionRepository["getProtocol"]>>

export class ConsumptionV2Middleware {
  constructor(
    private readonly repo: ConsumptionRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly activityRepo: ActivityRepository,
    private readonly entityActivityRepo: EntityActivityRepository
  ) {}

  logErrors = TransactionErrorHandler.logErrors

  consumption = async (c: Context) => {
    return z.any().transform(async (input, ctx: RefinementCtx) => {
      const parsed = await ConsumptionRequestSchema.safeParseAsync(input)
      if (!parsed.success) {
        c.set(
          "errors",
          formatErrorsWithData(parsed.error, c.var.t, "consumption-rabies")
        )
        throw new ValidationError()
      }

      const data = parsed.data
      const { programId } = c.var
      const userData = await this.transactionRepo.findWsUserById(
        c,
        c.var.userId!
      )

      this.#checkTransactionDate(c, ctx, data.actual_transaction_date)
      this.#checkStockUniqueness(c, ctx, data.materials)

      const materialIds = data.materials.map((m) =>
        getDefaultNumber(m.material_id)
      )
      const stockIds = data.materials.map((m) => getDefaultNumber(m.stock_id))

      const [permissions, materials, stocks] = await Promise.all([
        this.transactionRepo.findWsMaterialPermissonByIds(c, materialIds),
        this.transactionRepo.findWsMaterialByIds(c, materialIds, programId),
        this.transactionRepo.findWsStockByIds(c, stockIds, programId, false),
      ])

      const materialMap = associate(materials, "id")
      const stockMap = associate(stocks, "id")

      for (const [idx, material] of data.materials.entries()) {
        TransactionValidator.checkMaterialInStock(
          idx,
          c,
          ctx,
          stockMap,
          material.stock_id,
          material.material_id
        )
        TransactionValidator.checkMaterialWithoutStockQuality(
          c,
          ctx,
          idx,
          userData,
          material,
          materialMap,
          permissions
        )
        TransactionValidator.checkStockQty(c, ctx, idx, material, stockMap)
      }

      const [entity, activity, customer, entityActivities, vendorActivity] =
        await Promise.all([
          this.transactionRepo.findWsEntityById(c, data.entity_id, programId),
          this.activityRepo.findById(c, data.activity_id, programId),
          this.transactionRepo.findWsEntityById(c, data.customer_id, programId),
          this.entityActivityRepo.getListEntityActivity(
            c,
            data.entity_id,
            { is_ongoing: 1, page: 1, paginate: 100, offset: 0 },
            programId
          ),
          this.transactionRepo.findEntityActivityVendorCustomerEntityByIds(
            c,
            programId,
            data.entity_id,
            data.customer_id,
            data.entity_activity_id,
            data.activity_id
          ),
        ])

      this.#checkEntityContext(
        c,
        ctx,
        data,
        { entity, activity, customer, entityActivities, vendorActivity }
      )

      for (const [materialIdx, material] of data.materials.entries()) {
        const stock = stocks.find((s) => s.id === material.stock_id)
        if (!stock) continue

        this.#checkVialLimits(c, ctx, material, materialIdx, stock, customer)

        const protocol = await this.repo.getProtocol(
          c,
          data.activity_id,
          material.material_id
        )
        if (!protocol?.is_patient_needed) continue

        if (!material.patients?.length) {
          conditionsMessage(
            ctx,
            c.var.t("validator.required", {
              field: c.var.t("transaction.label.patient"),
            }),
            true,
            [`material.${materialIdx}`]
          )
          continue
        }

        for (const [patientIdx, patient] of material.patients.entries()) {
          await this.#checkPatientSequence(
            c,
            ctx,
            data,
            material,
            protocol,
            patient,
            materialIdx,
            patientIdx
          )
        }
      }

      return data
    })
  }

  // ─── Private validators ────────────────────────────────────────────────────

  #checkTransactionDate(
    c: Context,
    ctx: RefinementCtx,
    date: Date
  ) {
    const actual = new Date(moment(date).startOf("day").toISOString())
    conditionsMessage(
      ctx,
      c.var.t("validator.actual_transaction_date_must_be_today_or_earlier", {
        field: c.var.t("transaction.label.actual_transaction_date"),
      }),
      isNaN(actual.getTime()) || actual > new Date(),
      ["actual_transaction_date"]
    )
  }

  #checkStockUniqueness(
    c: Context,
    ctx: RefinementCtx,
    materials: ConsumptionRequest["materials"]
  ) {
    const seen = new Set<number>()
    for (const [idx, material] of materials.entries()) {
      const stockId = getDefaultNumber(material.stock_id)
      conditionsMessage(
        ctx,
        c.var.t("validator.unique", {
          field: c.var.t("transaction.label.stock_id"),
        }),
        !!stockId && seen.has(stockId),
        [`materials.${idx}.stock_id`]
      )
      seen.add(stockId)
    }
  }

  #checkEntityContext(
    c: Context,
    ctx: RefinementCtx,
    data: ConsumptionRequest,
    {
      entity,
      activity,
      customer,
      entityActivities,
      vendorActivity,
    }: {
      entity: Awaited<ReturnType<TransactionRepository["findWsEntityById"]>>
      activity: Awaited<ReturnType<ActivityRepository["findById"]>>
      customer: Awaited<ReturnType<TransactionRepository["findWsEntityById"]>>
      entityActivities: Awaited<
        ReturnType<EntityActivityRepository["getListEntityActivity"]>
      >
      vendorActivity: Awaited<
        ReturnType<
          TransactionRepository["findEntityActivityVendorCustomerEntityByIds"]
        >
      >
    }
  ) {
    const hasActivity = entityActivities.some((a) => a.id === data.activity_id)
    conditionsMessage(
      ctx,
      c.var.t("validator.not_exist", {
        field: c.var.t("transaction.label.entity_activity_id"),
      }),
      !data.entity_activity_id || !vendorActivity,
      ["entity_activity_id"]
    )
    conditionsMessage(
      ctx,
      c.var.t("validator.not_exist", {
        field: c.var.t("transaction.label.entity_id"),
      }),
      !entity,
      ["entity_id"]
    )
    conditionsMessage(
      ctx,
      c.var.t("validator.not_exist", {
        field: c.var.t("transaction.label.activity_id"),
      }),
      !activity,
      ["activity_id"]
    )
    conditionsMessage(
      ctx,
      c.var.t("validator.not_exist", {
        field: c.var.t("transaction.label.entity_id"),
      }),
      !customer,
      ["customer_id"]
    )
    conditionsMessage(
      ctx,
      c.var.t("validator.entity_activity_date_not_active", {
        field: c.var.t("transaction.label.activity_id"),
      }),
      !hasActivity,
      ["activity_id"]
    )
  }

  #checkVialLimits(
    c: Context,
    ctx: RefinementCtx,
    material: ConsumptionRequest["materials"][number],
    materialIdx: number,
    stock: Stock,
    customer: Customer
  ) {
    if (material.open_vial !== undefined && material.open_vial > 0) {
      conditionsMessage(
        ctx,
        c.var.t(`${materialIdx}`, "validator.invalid_unused_open_vial"),
        !!material.close_vial &&
          material.close_vial > 0 &&
          material.open_vial !== stock.open_vial_qty,
        [`materials.${materialIdx}.open_vial`]
      )
      conditionsMessage(
        ctx,
        c.var.t(`${materialIdx}`, "validator.submit_return_invalid_open_vial"),
        material.open_vial > Number(stock.open_vial_qty),
        [`materials.${materialIdx}.open_vial`]
      )
    }
    conditionsMessage(
      ctx,
      c.var.t(
        `${materialIdx}`,
        "validator.submit_return_close_vial_exceed_limit_open_vial"
      ),
      Number(material.close_vial) > Number(stock.qty),
      [`materials.${materialIdx}.close_vial`]
    )
    conditionsMessage(
      ctx,
      c.var.t(`${materialIdx}`, "validator.request_not_allowed"),
      Number(material.open_vial) > 0 && Number(customer?.is_open_vial) !== 1,
      [`materials.${materialIdx}.open_vial`]
    )
  }

  async #checkPatientSequence(
    c: Context,
    ctx: RefinementCtx,
    data: ConsumptionRequest,
    material: ConsumptionRequest["materials"][number],
    protocol: Protocol,
    patient: PatientRequest,
    materialIdx: number,
    patientIdx: number
  ) {
    conditionsMessage(
      ctx,
      c.var.t("validator.vaccine_no_need_sequence"),
      !protocol!.protocol_id && !!patient.vaccine_sequence,
      [`materials.${materialIdx}.patients.${patientIdx}`]
    )
    if (!protocol!.protocol_id) return

    if (!patient.vaccine_sequence) {
      conditionsMessage(
        ctx,
        c.var.t("validator.required", {
          field: c.var.t("transaction.label.vaccine_sequence"),
        }),
        true,
        [`materials.${materialIdx}.patients.${patientIdx}`]
      )
      return
    }

    this.#checkPatientDate(
      c,
      patient.year_before ?? undefined,
      patient.month_before ?? undefined
    )

    const patientId = await this.repo
      .getPatientIdByIdentity(
        c,
        patient.identity_type,
        patient.identity_number
      )
      .catch(() => null)

    const dataNextSequence = await this.repo.findSequenceById(
      c,
      patient.vaccine_sequence
    )

    if (
      dataNextSequence?.max != null &&
      (material.qty ?? 0) > dataNextSequence.max
    ) {
      conditionsMessage(
        ctx,
        c.var.t("validator.vaccine_sequence_qty_exceed_max", {
          max: dataNextSequence.max,
        }),
        true,
        [`materials.${materialIdx}.patients.${patientIdx}`]
      )
      return
    }

    let currentSequenceId: number | null = null
    let oldSequenceId: number | null | undefined
    let prequisiteQty: number | undefined

    let queryRules = c.var.trx
      .selectFrom("ws_vaccine_rules")
      .selectAll()
      .where("next_sequence", "=", patient.vaccine_sequence)

    if (patientId) {
      const sequenceCheck = await this.checkIfSequenceExist(
        c,
        patientId,
        patient,
        data.actual_transaction_date
      )

      if (sequenceCheck.status === "EXIST") {
        conditionsMessage(
          ctx,
          c.var.t("validator.patient_vaccine_sequence_exist"),
          true,
          [`transactions`]
        )
        return
      }

      if (sequenceCheck.status === "INSERTION") {
        // PEP Insertion only applies to PEP vaccine type (type_id = 2).
        // PrEP (type_id = 1) and booster (type_id = 3) fall through to the
        // normal EXIST error below.
        const VACCINE_TYPE_PEP = 2
        if (dataNextSequence?.type_id !== VACCINE_TYPE_PEP) {
          conditionsMessage(
            ctx,
            c.var.t("validator.patient_vaccine_sequence_exist"),
            true,
            [`transactions`]
          )
          return
        }

        // If the existing Day 0 qty already reached the sequence's max qty,
        // further PEP insertion is not allowed.
        const maxQty = dataNextSequence?.max
        if (maxQty && Number(sequenceCheck.consumption.actual_qty) >= maxQty) {
          conditionsMessage(
            ctx,
            c.var.t("validator.patient_vaccine_sequence_exist"),
            true,
            [`transactions`]
          )
          return
        }

        const insertionDate = moment(data.actual_transaction_date).startOf("day")
        const existingPep0Date = moment(sequenceCheck.consumption.actual_date).startOf("day")
        const dateIsInvalid = !sequenceCheck.consumption.actual_date || insertionDate.isSameOrAfter(existingPep0Date)

        conditionsMessage(
          ctx,
          c.var.t("validator.pep_insertion_date_must_be_before_existing"),
          dateIsInvalid,
          ["actual_transaction_date"]
        )

        if (!dateIsInvalid) {
          patient.is_pep_insertion = true
        }
        return
      }

      const currentVaccine = await c.var.trx
        .selectFrom("ws_consumptions")
        .select(["vaccine_sequence_id", "actual_qty", "actual_date"])
        .where("patient_id", "=", patientId)
        .where("protocol_id", "=", protocol!.protocol_id)
        .where("deleted_at", "is", null)
        .orderBy("actual_date", "desc")
        .executeTakeFirst()

      if (currentVaccine?.vaccine_sequence_id) {
        const [previousSequence, oldVaccine] = await Promise.all([
          this.repo.findSequenceById(c, currentVaccine.vaccine_sequence_id),
          c.var.trx
            .selectFrom("ws_consumptions")
            .select(["vaccine_sequence_id"])
            .where("patient_id", "=", patientId)
            .where("protocol_id", "=", protocol!.protocol_id)
            .where(
              "vaccine_sequence_id",
              "!=",
              currentVaccine.vaccine_sequence_id
            )
            .where("vaccine_sequence_id", "is not", null)
            .where("deleted_at", "is", null)
            .orderBy("actual_date", "desc")
            .executeTakeFirst(),
        ])

        const lastVaccineDate = new Date(
          moment(currentVaccine.actual_date).format("YYYY-MM-DD HH:mm:ss")
        )
        const actualDate = new Date(data.actual_transaction_date)
        const daysDiff = Math.floor(
          (actualDate.getTime() - lastVaccineDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )

        const datesValid = this.validateTransactionDates(
          currentVaccine.actual_date,
          actualDate,
          patient.other_sequences || []
        )

        if (!datesValid.valid) {
          conditionsMessage(
            ctx,
            c.var.t(
              "validator.actual_transaction_date_must_be_after_previous_dates"
            ),
            true,
            [`transactions`]
          )
          return
        }

        const activeDuration = Number(previousSequence?.active_duration ?? 0)
        const isExpired = activeDuration > 0 && daysDiff > activeDuration

        if (isExpired && !dataNextSequence?.is_start_sequence) {
          conditionsMessage(
            ctx,
            c.var.t("validator.active_duration_exceeded", {
              days: previousSequence?.active_duration,
              actual: daysDiff,
            }),
            true,
            [`transactions`]
          )
          return
        } else if (isExpired && dataNextSequence?.is_start_sequence && protocol!.protocol_id !== 2) {
          // Non-Dengue (protocol_id=2): expired patients may restart from start sequence
          return
        }

        currentSequenceId = currentVaccine.vaccine_sequence_id
        oldSequenceId = oldVaccine?.vaccine_sequence_id

        queryRules = queryRules.where(
          "previous_sequence",
          "=",
          currentSequenceId
        )

        if (currentVaccine.actual_qty) {
          prequisiteQty = currentVaccine.actual_qty
          queryRules = queryRules.where((eb) =>
            eb.or([
              eb("prerequisite_qty", "=", currentVaccine.actual_qty),
              eb("prerequisite_qty", "is", null),
            ])
          )
        }

        if (oldSequenceId) {
          queryRules = queryRules
            .where((eb) =>
              eb.or([
                eb("before_sequence", "=", oldSequenceId),
                eb("before_sequence", "is", null),
              ])
            )
            .orderBy("before_sequence", "desc")
        }
      } else {
        queryRules = queryRules.where("previous_sequence", "is", null)
      }
    } else {
      queryRules = queryRules.where("previous_sequence", "is", null)
    }

    const vaccineRule = await queryRules.executeTakeFirst()

    await this.validateOtherSequences(
      c,
      ctx,
      currentSequenceId,
      patient,
      materialIdx,
      patientIdx,
      prequisiteQty
    )

    if (vaccineRule) {
      if (
        vaccineRule.other_sequences &&
        !patient.other_sequences?.length
      ) {
        const ids =
          typeof vaccineRule.other_sequences === "object"
            ? vaccineRule.other_sequences
            : JSON.parse(vaccineRule.other_sequences)
        const otherSequences = await this.repo.getOtherSequences(c, ids)
        conditionsMessageWithData(
          ctx,
          {
            message: c.var.t("validator.invalid_vaccine_sequence_jump", {
              field1: c.var.t(otherSequences[0]?.title || ""),
              field2: c.var.t(dataNextSequence?.title || ""),
            }),
            data: otherSequences.filter(Boolean).map((seq) => ({
              protocol_id: protocol!.protocol_id,
              is_kipi: protocol!.is_kipi,
              vaccine_sequence: seq.id,
              vaccine_sequence_title: c.var.t(seq.title || ""),
              vaccine_type: seq.type_id,
              vaccine_type_title: c.var.t(seq.type_title || ""),
              vaccine_method: seq.method_id,
              vaccine_method_title: c.var.t(seq.method_title || ""),
              date: null,
            })),
          },
          true,
          [`materials.${materialIdx}.patients.${patientIdx}`]
        )
      }
      return
    }

    if (currentSequenceId) {
      const hasNextRule = await c.var.trx
        .selectFrom("ws_vaccine_rules")
        .selectAll()
        .where("previous_sequence", "=", currentSequenceId)
        .executeTakeFirst()

      if (!hasNextRule) {
        conditionsMessage(
          ctx,
          c.var.t("validator.vaccine_sequence_completed", {
            field1: patient.identity_number,
          }),
          true,
          [`transactions`]
        )
        return
      }
    }

    if (!patient.other_sequences?.length) {
      await this.#checkSequenceGap(
        c,
        ctx,
        currentSequenceId,
        oldSequenceId ?? null,
        patient,
        protocol!,
        dataNextSequence,
        prequisiteQty,
        materialIdx,
        patientIdx
      )
    }
  }

  async #checkSequenceGap(
    c: Context,
    ctx: RefinementCtx,
    currentSequenceId: number | null,
    oldSequenceId: number | null,
    patient: PatientRequest,
    protocol: Protocol,
    dataNextSequence: Awaited<ReturnType<ConsumptionRepository["findSequenceById"]>>,
    prequisiteQty: number | undefined,
    materialIdx: number,
    patientIdx: number
  ) {
    const { previous_sequences, next_sequences } =
      await this.repo.getSequenceIds(
        c,
        currentSequenceId,
        oldSequenceId,
        patient.vaccine_sequence!,
        prequisiteQty,
        protocol!.protocol_id
      )

    if (previous_sequences.length > 0) {
      const otherSequences = await this.repo.getOtherSequences(
        c,
        previous_sequences
      )
      conditionsMessageWithData(
        ctx,
        {
          message: c.var.t("validator.invalid_vaccine_sequence_jump", {
            field1: c.var.t(otherSequences[0]?.title || ""),
            field2: c.var.t(dataNextSequence?.title || ""),
          }),
          data: otherSequences.filter(Boolean).map((seq) => ({
            protocol_id: protocol!.protocol_id,
            is_kipi: protocol!.is_kipi,
            vaccine_sequence: seq.id,
            vaccine_sequence_title: c.var.t(seq.title || ""),
            vaccine_type: seq.type_id,
            vaccine_type_title: c.var.t(seq.type_title || ""),
            vaccine_method: seq.method_id,
            vaccine_method_title: c.var.t(seq.method_title || ""),
            date: null,
          })),
        },
        true,
        [`materials.${materialIdx}.patients.${patientIdx}`]
      )
      return
    }

    if (next_sequences.length > 0) {
      const [first] = await this.repo.getOtherSequences(
        c,
        next_sequences.slice(0, 1)
      )
      conditionsMessage(
        ctx,
        c.var.t("validator.invalid_vaccine_sequence", {
          field1: c.var.t(first?.title || ""),
        }),
        true,
        [`transactions`]
      )
      return
    }

    conditionsMessage(
      ctx,
      c.var.t("validator.wrong_vaccine_sequence"),
      true,
      [`transactions`]
    )
  }

  #checkPatientDate(c: Context, year?: number, month?: number) {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    if (
      year &&
      month &&
      (year > currentYear || (year === currentYear && month > currentMonth))
    ) {
      throw new ValidationError(
        c.var.t(
          "validator.transaction_medical_history_date_must_not_be_later_than_current_date"
        )
      )
    }
  }

  // ─── Reusable validation logic (kept public for testability) ──────────────

  async checkIfSequenceExist(
    c: Context,
    patientId: number,
    patient: PatientRequest,
    actual_transaction_date: Date
  ) {
    const allExistingSequence = await c.var.trx
      .selectFrom("ws_consumptions as wc")
      .leftJoin("ws_transactions as wt", "wt.id", "wc.transaction_id")
      .innerJoin(
        "ws_vaccine_sequences as wvs",
        "wvs.id",
        "wc.vaccine_sequence_id"
      )
      .select([
        "wc.id as consumption_id",
        "wt.change_qty",
        "wc.vaccine_sequence_id as vaccine_sequence_id",
        "wc.actual_date as actual_date",
        "wc.actual_qty as actual_qty",
        "wvs.active_duration as active_duration",
        "wvs.is_start_sequence as is_start_sequence",
      ])
      .where("wc.patient_id", "=", patientId)
      .where("wc.deleted_at", "is", null)
      .execute()

    const existingSequence = allExistingSequence.find(
      (seq) => seq.vaccine_sequence_id === patient.vaccine_sequence
    )

    if (!existingSequence) return { status: "NOT_FOUND" as const }

    const lastVaccineDate = moment(existingSequence.actual_date).startOf("day")
    const actualDate = moment(actual_transaction_date).startOf("day")
    const daysDiff = actualDate.diff(lastVaccineDate, "days") + 1

    const activeDuration = Number(existingSequence.active_duration ?? 0)
    const isExpired = activeDuration > 0 && daysDiff > activeDuration

    if (!isExpired) {
      if (existingSequence.is_start_sequence) {
        return { status: "INSERTION" as const, consumption: existingSequence }
      }
      return { status: "EXIST" as const }
    }

    return { status: "EXPIRED" as const }
  }

  validateTransactionDates(
    prevTransactionDate: Date | null,
    actualTransactionDate: Date,
    otherSequences: { actual_transaction_date?: Date | null }[]
  ): { valid: boolean } {
    let prevDate = prevTransactionDate
    for (const seq of otherSequences) {
      const currentDate = seq.actual_transaction_date
      if (!prevDate) { prevDate = currentDate ?? null; continue }
      if (!currentDate) continue
      if (moment(currentDate).startOf("day").isBefore(moment(prevDate).startOf("day"))) {
        return { valid: false }
      }
      prevDate = currentDate
    }
    if (
      prevDate &&
      moment(actualTransactionDate)
        .startOf("day")
        .isBefore(moment(prevDate).startOf("day"))
    ) {
      return { valid: false }
    }
    return { valid: true }
  }

  async validateOtherSequences(
    c: Context,
    ctx: RefinementCtx,
    currentSequenceId: number | null,
    patient: PatientRequest,
    materialIdx: number,
    patientIdx: number,
    prequisiteQty?: number
  ) {
    if (!patient.other_sequences?.length) return

    const otherSequences = patient.other_sequences
      .filter((it) => it.actual_transaction_date)
      .map((it) => it.vaccine_sequence)

    if (otherSequences.length === 0) {
      conditionsMessage(
        ctx,
        c.var.t("validator.date_other_sequences_cannot_empty"),
        true,
        [`materials.${materialIdx}.patients.${patientIdx}.other_sequences`]
      )
      return
    }

    otherSequences.push(patient.vaccine_sequence!)

    const dataSequences = [
      { prev: currentSequenceId, next: otherSequences[0], before: null, prequisiteQty },
      ...otherSequences.slice(0, -1).map((seq, i) => ({
        prev: seq,
        next: otherSequences[i + 1],
        before: i === 0 ? currentSequenceId : otherSequences[i - 1],
        prequisiteQty: null as number | null | undefined,
      })),
    ]

    for (const sequence of dataSequences) {
      let query = c.var.trx
        .selectFrom("ws_vaccine_rules")
        .select(["id"])
        .where("deleted_at", "is", null)
        .where((eb) =>
          eb.or([eb("other_sequences", "is", null), eb("other_sequences", "=", "")])
        )

      query = sequence.prev
        ? query.where("previous_sequence", "=", sequence.prev)
        : query.where("previous_sequence", "is", null)

      query = sequence.next
        ? query.where("next_sequence", "=", sequence.next)
        : query.where("next_sequence", "is", null)

      if (sequence.prequisiteQty) {
        query = query.where((eb) =>
          eb.or([
            eb("prerequisite_qty", "=", Number(sequence.prequisiteQty)),
            eb("prerequisite_qty", "is", null),
          ])
        )
      }

      if (sequence.before) {
        query = query.where((eb) =>
          eb.or([
            eb("before_sequence", "=", sequence.before),
            eb("before_sequence", "is", null),
          ])
        )
      }

      const rule = await query.executeTakeFirst()
      if (!rule) {
        conditionsMessage(
          ctx,
          c.var.t("validator.invalid_other_sequences"),
          true,
          [`materials.${materialIdx}.patients.${patientIdx}.other_sequences`]
        )
        return
      }
    }
  }
}
