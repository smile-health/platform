import { DEVICE_TYPE } from "@/common/constants/device.js"
import { PROTOCOL_TYPE } from "@/common/constants/general.js"
import {
  TRANSACTION_CHANGE_TYPE,
  TRANSACTION_TYPE,
} from "@/common/constants/transaction.js"
import { BatchRepository } from "@/modules/batch/batch.repository.js"
import StockOpnamePeriodRepository from "@/modules/stock-opname-period/stock-opname-period.repository.js"
import { StockRepository } from "@/modules/stock/stock.repository.js"
import { Context } from "hono"
import { InsertResult } from "kysely"
import moment from "moment"
import { TransactionPublisher } from "../transaction.publisher.js"
import { PublishTrxDTO } from "../transaction.schema.js"
import { RabiesPatientDTO } from "./consumption-rabies/consumption-rabies.schema.js"
import { ConsumptionRepository } from "./consumption.repository.js"
import {
  ConsumptionMaterialRequestSchema,
  ConsumptionRequest,
  PatientRequest,
} from "./consumption.schema.js"

const VACCINE_METHOD = { INTRAMUSCULAR: 1, INTRADERMAL: 2 }
const VACCINE_TYPE = { PREP: 1, PEP: 2, BOOSTER: 3 }

type Protocol = Awaited<ReturnType<ConsumptionRepository["getProtocol"]>>
type JumpingResults = Record<string, InsertResult[]>

export class ConsumptionV2Module {
  constructor(
    private readonly repository: ConsumptionRepository,
    private readonly stockRepo: StockRepository,
    private readonly batchRepo: BatchRepository,
    private readonly publisher: TransactionPublisher,
    private readonly stockOpnamePeriodRepo: StockOpnamePeriodRepository
  ) {}

  readonly injectionCount = (
    vaccine_method: number | undefined,
    vaccine_type: number | undefined,
    dose: number
  ) => {
    if (vaccine_method === VACCINE_METHOD.INTRADERMAL) {
      return vaccine_type === VACCINE_TYPE.BOOSTER ? 1 : 2
    }
    return dose
  }

  async consumption(c: Context, body: ConsumptionRequest) {
    const { userId, programId } = c.var
    const deviceType = c.req.header("device-type")
    const publishMessages: PublishTrxDTO[] = []

    // Fetch shared context in parallel upfront
    const [transactionType, canUpdateCutoffQty, entityActivity] =
      await Promise.all([
        this.repository.findWsTransactionTypeById(
          c,
          TRANSACTION_TYPE.CONSUMPTION
        ),
        this.stockOpnamePeriodRepo.canUpdateCutoffQty(c),
        this.repository.findWsEntityActivityByEntityAndActivity(
          c,
          body.entity_id,
          body.activity_id,
          programId
        ),
      ])

    let lastInsertId: bigint | undefined

    for (const material of body.materials) {
      // Stock must be fetched first (batch_id comes from stock)
      const stocks = await this.repository.findWsStockByIds(
        c,
        [material.stock_id!],
        programId
      )
      const stock = stocks[0]

      // Protocol and batch are independent of each other — fetch in parallel
      const [protocol, batch] = await Promise.all([
        this.repository.getProtocol(c, body.activity_id, material.material_id),
        this.batchRepo.findOne(c, { id: stock?.batch_id ?? 0 }),
      ])

      // Process jumping (other_sequences) transactions before main transaction
      const jumpingResults = await this.#processJumpingTransactions(
        c,
        body,
        material,
        {
          entityActivity,
          transactionType,
          stock,
          batch,
          userId: userId!,
          deviceType,
          publishMessages,
        }
      )

      const qty = this.#getChangeQty(
        Number(transactionType?.change_type),
        material.qty ?? material.close_vial ?? 0,
        stock?.qty ?? 0
      )

      const openVialQty = material.open_vial
        ? this.#getChangeQty(
            Number(transactionType?.change_type ?? 0),
            material.open_vial,
            stock?.open_vial_qty ?? 0
          )
        : { changeQty: 0, newQty: 0 }

      const payloadQty: Record<string, number> = { qty: qty.newQty }
      if (canUpdateCutoffQty) payloadQty["cutoff_qty"] = qty.newQty
      if (material.open_vial && material.open_vial > 0) {
        payloadQty["open_vial_qty"] = openVialQty.newQty
      }

      // Create main transaction — patients depend on this ID, stock update does not
      const transaction = await this.repository.create(c, {
        activity_id: body.activity_id,
        entity_id: body.entity_id,
        stock_id: material.stock_id,
        transaction_reason_id: null,
        transaction_type_id: transactionType?.id ?? null,
        order_id: null,
        change_qty: qty.changeQty,
        change_qty_open_vial: openVialQty.changeQty,
        opening_qty: stock?.qty ?? 0,
        opening_qty_open_vial: stock?.open_vial_qty ?? 0,
        created_at: new Date(),
        created_by: userId!,
        updated_at: new Date(),
        updated_by: userId!,
        deleted_at: null,
        deleted_by: null,
        actual_transaction_date: body.actual_transaction_date,
        commit_datetime: null,
        device_type: deviceType ? DEVICE_TYPE[deviceType] : null,
        entity_activity_id: entityActivity?.id,
        companion_entity_id: body.customer_id,
        batch_code: batch?.code ?? null,
        status: 1,
        transaction_companion: null,
        returnable: 1,
      })

      lastInsertId = transaction.insertId

      // Stock update and patient processing are independent — run in parallel
      await Promise.all([
        this.stockRepo.update(c, payloadQty, { id: material.stock_id! }),
        this.#processPatients(
          c,
          body,
          material,
          protocol,
          Number(transaction.insertId),
          jumpingResults,
          userId!
        ),
      ])

      const publishPayload: PublishTrxDTO = { id: Number(transaction.insertId) }
      if (protocol?.protocol_id === PROTOCOL_TYPE.RABIES) {
        publishPayload.rabies = {
          vaccine_method: material.vaccine_method,
          patients: material.patients as unknown as RabiesPatientDTO[],
        }
      }
      publishMessages.push(publishPayload)
    }

    await this.publisher.processCreate(c, publishMessages)

    return {
      success: "ok",
      message: "Consumption has been created",
      data: {
        insertId: Number(lastInsertId),
        actual_transaction_date: body.actual_transaction_date,
      },
    }
  }

  // ─── Patient processing ────────────────────────────────────────────────────

  async #processPatients(
    c: Context,
    body: ConsumptionRequest,
    material: ConsumptionMaterialRequestSchema,
    protocol: Protocol,
    transactionId: number,
    jumpingResults: JumpingResults,
    userId: number
  ) {
    if (!protocol?.is_patient_needed) return
    if (!material.identity_type && !material.patients?.length) return

    const patientsToProcess = material.patients?.length
      ? material.patients
      : this.#buildSinglePatient(material)

    for (const patientData of patientsToProcess) {
      if (!patientData.identity_type || !patientData.identity_number) continue
      await this.#processPatient(
        c,
        body,
        material,
        protocol,
        patientData,
        transactionId,
        jumpingResults,
        userId
      )
    }
  }

  async #processPatient(
    c: Context,
    body: ConsumptionRequest,
    material: ConsumptionMaterialRequestSchema,
    protocol: Protocol,
    patientData: PatientRequest,
    transactionId: number,
    jumpingResults: JumpingResults,
    userId: number
  ) {
    const patient = await this.repository.updateOrCreatePatient(c, {
      identity_type: patientData.identity_type,
      identity_number: patientData.identity_number,
      name: patientData.name || null,
      phone_number: patientData.phone_number,
      gender: patientData.gender || null,
      birth_date: patientData.birth_date?.toString() || null,
      marital_status: patientData.marital_status || 0,
      religion_id: patientData.religion_id || null,
      ethnic_id: patientData.ethnic_id || null,
      residential_address: patientData.residential_address || null,
      education_id: patientData.education_id || null,
      occupation_id: patientData.occupation_id || null,
      address: patientData.address || null,
      province_id: patientData.province_id || null,
      regency_id: patientData.regency_id || null,
      subdistrict_id: patientData.subdistrict_id || null,
      village_id: patientData.village_id || null,
      pos_code: patientData.pos_code || null,
      rt: patientData.rt || null,
      rw: patientData.rw || null,
      residential_province_id: patientData.residential_province_id || null,
      residential_regency_id: patientData.residential_regency_id || null,
      residential_subdistrict_id:
        patientData.residential_subdistrict_id || null,
      residential_village_id: patientData.residential_village_id || null,
    })

    const patientId = patient.insertId
      ? Number(patient.insertId)
      : await this.repository.getPatientIdByIdentity(
          c,
          patientData.identity_type,
          patientData.identity_number
        )

    const actual_qty = material.qty ?? material.close_vial ?? 0
    // For PEP insertion the Day 0 base date is the insertion date itself, not the existing Day 0
    const nextVaccineDate = await this.#calculateNextVaccineDate(
      c,
      patientId,
      patientData,
      protocol,
      actual_qty,
      body.actual_transaction_date,
      !!patientData.is_pep_insertion
    )
    const injection_count = this.injectionCount(
      material.vaccine_method,
      material.vaccine_type,
      actual_qty
    )

    let consumptionResult: InsertResult | null = null

    if (!patientData.isInjectSequence) {
      consumptionResult = await this.repository.createConsumption(c, {
        transaction_id: transactionId,
        patient_id: patientId,
        protocol_id: protocol?.protocol_id || null,
        vaccine_sequence_id: patientData.vaccine_sequence
          ? Number(patientData.vaccine_sequence)
          : null,
        vaccine_method_id: material.vaccine_method
          ? Number(material.vaccine_method)
          : null,
        vaccine_type_id: material.vaccine_type
          ? Number(material.vaccine_type)
          : null,
        stop_notification: nextVaccineDate ? 0 : null,
        actual_date: body.actual_transaction_date,
        actual_qty,
        created_by: userId,
        updated_by: userId,
        next_vaccine_date: nextVaccineDate,
        injection_count,
        is_pep_insertion: patientData.is_pep_insertion ? 1 : null,
      })

      if (
        patientData.is_pep_insertion &&
        consumptionResult?.insertId &&
        protocol?.protocol_id &&
        patientData.vaccine_sequence
      ) {
        await this.#doProcessPepInsertion(
          c,
          patientId,
          Number(patientData.vaccine_sequence),
          Number(consumptionResult.insertId),
          actual_qty,
          body.actual_transaction_date,
          userId,
          protocol.protocol_id,
          body.entity_id
        )
      }
    } else {
      await c.var.trx
        .updateTable("ws_consumptions")
        .set({
          transaction_id: transactionId,
          reference_consumption_id: null,
          actual_date: body.actual_transaction_date,
          actual_qty,
          created_by: userId,
          updated_by: userId,
        })
        .where("id", "=", patientData.idConsumptionInjectSequence || 0)
        .execute()
    }

    // Link jumping (other_sequences) consumption records to the main consumption
    const jumpingForPatient = jumpingResults[patientData.identity_number]
    if (
      !patientData.isInjectSequence &&
      consumptionResult?.insertId &&
      jumpingForPatient?.length
    ) {
      await c.var.trx
        .updateTable("ws_consumptions")
        .set({
          patient_id: patientId,
          reference_consumption_id: Number(consumptionResult.insertId),
          protocol_id: protocol?.protocol_id,
        })
        .where(
          "id",
          "in",
          jumpingForPatient.map((r) => Number(r.insertId))
        )
        .execute()
    }
  }

  async #calculateNextVaccineDate(
    c: Context,
    patientId: number,
    patientData: PatientRequest,
    protocol: Protocol,
    actual_qty: number,
    actualDate: Date,
    forceActualDate = false
  ): Promise<Date | null> {
    if (!patientData.vaccine_sequence) return null

    const nextVaccine = await this.repository.findNextSequence(
      c,
      patientId,
      patientData.vaccine_sequence,
      protocol?.protocol_id!,
      actual_qty
    )
    if (!nextVaccine?.day_start) return null

    const firstVaccine = forceActualDate
      ? null
      : await this.repository.findSequenceDay0(c, patientId)
    const baseDate = firstVaccine ? firstVaccine.actual_date : actualDate
    return moment(baseDate).add(nextVaccine.day_start, "days").toDate()
  }

  async #doProcessPepInsertion(
    c: Context,
    patientId: number,
    insertionSeqId: number,
    insertionConsumptionId: number,
    insertedQty: number,
    insertionDate: Date,
    userId: number,
    protocolId: number,
    entityId: number
  ) {
    const existingConsumptions =
      await this.repository.getPatientPepConsumptions(
        c,
        patientId,
        insertionConsumptionId
      )
    if (!existingConsumptions.length) return

    // Build the ordered list of target slots after the inserted Day 0.
    // The first step uses insertedQty to pick the correct branch (Zagreb vs Essen);
    // subsequent steps follow the chain naturally without a qty filter.
    const targetChain = await this.#buildTargetChain(
      c,
      insertionSeqId,
      insertedQty,
      protocolId
    )
    if (!targetChain.length) return

    const preShiftState = existingConsumptions
      .filter((con) => con.vaccine_sequence_id !== null)
      .map((con) => ({
        id: con.id,
        original_sequence_id: con.vaccine_sequence_id!,
      }))

    // Pre-fetch all target sequence data to get type_id and day_start in one pass
    const targetSeqData = await Promise.all(
      targetChain.map((id) => this.repository.findSequenceById(c, id))
    )

    for (let i = 0; i < existingConsumptions.length; i++) {
      const consumption = existingConsumptions[i]
      if (!consumption.vaccine_sequence_id) continue

      const targetSeqId = targetChain[i] ?? null
      if (!targetSeqId) continue // chain exhausted — leave record unchanged

      const targetSeq = targetSeqData[i]
      await this.repository.updateConsumptionSequence(
        c,
        consumption.id,
        targetSeqId,
        userId,
        entityId,
        targetSeq?.type_id ?? null
      )

      // next slot in chain tells us the next_vaccine_date for this record
      const afterTargetSeq = targetSeqData[i + 1] ?? null
      let newNextVaccineDate: Date | null = null
      let stopNotification: 0 | null = null

      if (afterTargetSeq?.day_start) {
        newNextVaccineDate = moment(insertionDate)
          .add(afterTargetSeq.day_start, "days")
          .toDate()
        stopNotification = 0
      }

      await this.repository.updateConsumptionNextVaccineDate(
        c,
        consumption.id,
        newNextVaccineDate,
        stopNotification,
        userId
      )
    }

    await this.repository.createPepInsertionLog(c, {
      patient_id: patientId,
      inserted_by: userId,
      insertion_consumption_id: insertionConsumptionId,
      pre_shift_state: preShiftState,
    })
  }

  async #buildTargetChain(
    c: Context,
    fromSeqId: number,
    insertedQty: number,
    protocolId: number
  ): Promise<number[]> {
    const chain: number[] = []
    let prevSeqId: number | null = null
    let currentSeqId: number | null = fromSeqId
    const visited = new Set<number>([fromSeqId])

    let step = 0
    while (chain.length < 20) {
      // First step uses insertedQty to select the correct branch (Zagreb=2, Essen=1).
      // Subsequent steps pass prevSeqId as before_sequence so the DB picks the
      // Zagreb-specific rule (Day7→Day21) over the Essen-specific rule (Day7→Day14)
      // — same disambiguation logic as v1 middleware.
      const prereq = step === 0 ? insertedQty : null
      const nextId = await this.repository.getNextSequenceIdInChain(
        c,
        currentSeqId!,
        protocolId,
        prereq,
        prevSeqId
      )
      if (!nextId || visited.has(nextId)) break
      visited.add(nextId)
      chain.push(nextId)
      prevSeqId = currentSeqId
      currentSeqId = nextId
      step++
    }

    return chain
  }

  // ─── Jumping (other_sequences) transactions ────────────────────────────────

  async #processJumpingTransactions(
    c: Context,
    body: ConsumptionRequest,
    material: ConsumptionMaterialRequestSchema,
    opts: {
      entityActivity: { id?: number } | undefined
      transactionType: { id?: number; change_type?: number } | undefined
      stock: { qty?: number | null; open_vial_qty?: number | null } | undefined
      batch: { code?: string | null } | undefined
      userId: number
      deviceType: string | undefined
      publishMessages: PublishTrxDTO[]
    }
  ): Promise<JumpingResults> {
    if (!material.patients?.length) return {}

    const results: JumpingResults = {}

    for (const patientData of material.patients) {
      if (!patientData.other_sequences?.length) continue

      const sequences = patientData.other_sequences.filter(
        (os) => os.actual_transaction_date
      )
      if (!sequences.length) continue

      results[patientData.identity_number] = []

      for (let i = 0; i < sequences.length; i++) {
        const seq = sequences[i]

        const zeroTransaction = await this.repository.create(c, {
          activity_id: body.activity_id,
          entity_id: body.entity_id,
          stock_id: material.stock_id,
          transaction_reason_id: null,
          transaction_type_id: opts.transactionType?.id ?? null,
          order_id: null,
          change_qty: 0,
          opening_qty: opts.stock?.qty ?? 0,
          created_at: new Date(),
          created_by: opts.userId,
          updated_at: new Date(),
          updated_by: opts.userId,
          deleted_at: null,
          deleted_by: null,
          actual_transaction_date: seq.actual_transaction_date,
          commit_datetime: null,
          device_type: opts.deviceType ? DEVICE_TYPE[opts.deviceType] : null,
          entity_activity_id: opts.entityActivity?.id,
          companion_entity_id: body.customer_id,
          batch_code: opts.batch?.code ?? null,
          status: 1,
          transaction_companion: null,
          returnable: 1,
        })

        const prevSeq = Number(seq.vaccine_sequence)
        const nextSeq =
          i === sequences.length - 1
            ? patientData.vaccine_sequence
            : sequences[i + 1]?.vaccine_sequence

        const { actualQty, method_id, type_id } =
          await this.repository.findActualQtyFromSequence(
            c,
            prevSeq,
            Number(nextSeq)
          )

        const sequenceData = await this.repository.findSequenceById(
          c,
          Number(seq.vaccine_sequence)
        )
        const nextVaccineDate = sequenceData?.next_duration
          ? moment(seq.actual_transaction_date)
              .add(sequenceData.next_duration, "days")
              .toDate()
          : null

        const injection_count = this.injectionCount(
          method_id,
          type_id,
          actualQty
        )

        const seqConsumption = await this.repository.createConsumption(c, {
          transaction_id: Number(zeroTransaction.insertId),
          patient_id: 0,
          protocol_id: PROTOCOL_TYPE.RABIES,
          vaccine_sequence_id: Number(seq.vaccine_sequence),
          vaccine_method_id: method_id,
          vaccine_type_id: type_id,
          actual_date: seq.actual_transaction_date || null,
          actual_qty: actualQty,
          stop_notification: nextVaccineDate ? 0 : null,
          created_by: opts.userId,
          updated_by: opts.userId,
          next_vaccine_date: nextVaccineDate,
          injection_count,
        })

        results[patientData.identity_number].push(seqConsumption)

        opts.publishMessages.push({
          id: Number(zeroTransaction.insertId),
          rabies: { is_other_sequence: true },
        })
      }
    }

    return results
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  readonly #getChangeQty = (
    transactionType: number,
    changeQty: number,
    currentQty = 0
  ) => {
    const changeVal =
      transactionType === TRANSACTION_CHANGE_TYPE.REMOVE
        ? changeQty * -1
        : changeQty
    const newVal =
      transactionType === TRANSACTION_CHANGE_TYPE.RESTOCK
        ? changeQty
        : currentQty + changeVal
    return { changeQty: changeVal, newQty: newVal }
  }

  #buildSinglePatient(
    material: ConsumptionMaterialRequestSchema
  ): PatientRequest[] {
    return [
      {
        identity_type: material.identity_type!,
        identity_number: material.identity_number!,
        name: undefined!,
        phone_number: material.phone_number!,
        vaccine_sequence: undefined,
        other_sequences: undefined,
        isInjectSequence: false,
        idConsumptionInjectSequence: 0,
      },
    ]
  }
}
