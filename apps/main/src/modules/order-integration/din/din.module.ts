/* eslint-disable @typescript-eslint/no-explicit-any */
import { ORDER_REASON, ORDER_STATUS } from "@/common/constants/order.js"
import { BudgetSourceRepository } from "@/modules/budget-source/budget-source.repository.js"
import { OrderCentralDeliveryModule } from "@/modules/order-central-delivery/order-central-delivery.module.js"
import { OrderStatusCancelModule } from "@/modules/order-status/order-status-cancel/order-status-cancel.module.js"
import { AuthKeycloakService } from "@smile/lib/api/auth.service.js"
import { Context } from "hono"
import z from "zod"
import { DinContext } from "./din.context.js"
import { OrderCreateFromDinPublisher } from "./din.publisher.js"
import { DinRepository } from "./din.repository.js"
import {
  CreateOrderDinRequest,
  LoginRequestSchema,
  WSMaterialSchema,
} from "./din.schemas.js"

interface OutputStock {
  ordered_qty: number
  budget_year: number
  budget_source_id: number
  total_price: number
  expired_date?: Date
  manufacture_name?: string
  production_date?: Date
  batch_code?: string
}

interface OutputOrderItem {
  material_id: number
  is_managed_in_batch: boolean
  stocks: OutputStock[]
  metadata: any
}

export class DinModule {
  constructor(
    private readonly repo: DinRepository,
    private readonly budgetSourceRepo: BudgetSourceRepository,
    private readonly orderCentralDeliveryModule: OrderCentralDeliveryModule,
    protected readonly authRepo: AuthKeycloakService,
    protected readonly orderStatusCancelModule: OrderStatusCancelModule,
    protected readonly publisher: OrderCreateFromDinPublisher
  ) {}

  async create(c: DinContext, body: CreateOrderDinRequest) {
    // Preparation Data
    // await this.#preparationMasterData(c, body)
    await this.publisher.processCreate(c, body)
    return "success post data"
  }

  async post(c: DinContext, body: CreateOrderDinRequest, client: any) {
    const originalBody = {
      key: body.key,
      doc_num: body.doc_num,
      ref_num: body.ref_num,
      code: body.code,
      line: body.line,
      line_ref: body.line_ref,
      carrier: body.carrier,
      carrier_ref: body.carrier_ref,
      sumber_dana: body.sumber_dana,
      penanggung_jawab: body.penanggung_jawab,
      biaya_transport: body.biaya_transport,
      total_transaksi: body.total_transaksi,
      status: body.status,
      program: body.program,
      note: body.note,
      pengirim: body.pengirim,
      penerima: body.penerima,
      data: body.data,
    }

    Object.assign(c.var, {
      dataClient: client,
      originalBody,
    })

    await this.#preparationMasterData(c, body)
  }

  async createLog(
    c: DinContext,
    client: any,
    requestType: string,
    requestBody: any,
    responsePayload: {
      status?: number
      body?: any
      error?: any
      stack?: string
    },
    options?: {
      orderId?: number | null
    }
  ) {
    const { requestUrl } = c.var
    const orderId = options?.orderId ?? null

    try {
      const logData = {
        client_id: client.id,
        source_id: orderId,
        source_type: "order",
        flow: "in",
        tag: requestType,
        request: JSON.stringify({
          method: "POST",
          url: requestUrl,
          body:
            typeof requestBody === "object"
              ? JSON.stringify(requestBody)
              : requestBody,
        }),
        response: JSON.stringify({
          status: responsePayload.status ?? 200,
          body:
            typeof responsePayload.body === "object" && responsePayload.body
              ? JSON.stringify(responsePayload.body)
              : responsePayload.body,
          error:
            responsePayload.error instanceof Error
              ? responsePayload.error.message
              : responsePayload.error,
          stack:
            responsePayload.error instanceof Error
              ? responsePayload.error.stack
              : responsePayload.stack,
        }),
      }

      await this.repo.createLog(logData)
    } catch (error) {
      console.error(
        `❌ [createLog] Failed to create log for requestType: ${requestType}`
      )
      console.error(
        `   Error: ${error instanceof Error ? error.message : error}`
      )
    }
  }

  async #preparationMasterData(c: DinContext, body: CreateOrderDinRequest) {
    // Gunakan originalBody untuk validasi jika ada (untuk menghindari field tambahan dari dataExtra)
    const bodyForValidation = c.var.originalBody || body
    const doc_num = body.doc_num

    // 1. IDEMPOTENCY CHECK with SELECT FOR UPDATE (IN TRANSACTION)
    // This is the KEY to prevent race condition - lock the row BEFORE processing
    // When doc_num doesn't exist yet, this creates a gap lock that blocks concurrent inserts
    const existingOrder = await this.repo.checkOrderByDocNumberWithLock(
      c,
      doc_num
    )

    if (existingOrder) {
      // 2. Order exists - validate payload to determine if we should cancel and recreate
      const validationResult = await this.#validatePayload(
        c,
        bodyForValidation,
        body,
        existingOrder
      )

      // Handle validation result
      if (typeof validationResult === "string") {
        // Reject case: shipped (same payload), fulfilled, canceled, or being processed
        console.log(validationResult)
        return
      }

      // If we get here with existingOrder and shouldCancel=true, cancel old order first
      if (validationResult.shouldCancel && validationResult.orderIdToCancel) {
        const payloadCancel = {
          order_reason: ORDER_REASON.OTHERS,
          comment: "Order Revision from DIN",
          is_not_send_rabbitmq: true,
        }

        await this.orderStatusCancelModule.update(
          c,
          validationResult.orderIdToCancel,
          payloadCancel
        )
        console.log(
          `✅ [CANCEL] Order canceled - order_id: ${validationResult.orderIdToCancel}, doc_num: ${body.doc_num}`
        )
      } else {
        // Order exists but no cancellation needed (being processed with same payload)
        console.log(
          `ℹ️  [IDEMPOTENCY] Order already exists (locked) - doc_num: ${doc_num}, order_id: ${existingOrder.id}`
        )
        await this.createLog(
          c,
          c.var.client,
          "create_order",
          c.var.originalBody || body,
          {
            status: 400,
            body: `Order with doc_num ${doc_num} already exists`,
            error: { existing_order_id: existingOrder.id },
          }
        )
        return
      }
    } else {
      // 3. Order doesn't exist - validate payload to check if we need to cancel old order
      const validationResult = await this.#validatePayload(
        c,
        bodyForValidation,
        body
      )

      // Handle validation result
      if (typeof validationResult === "string") {
        console.log(validationResult)
        return
      }

      // 4. Cancel old order if needed (doc_num sama tapi ada field yang beda)
      if (validationResult.shouldCancel && validationResult.orderIdToCancel) {
        const payloadCancel = {
          order_reason: ORDER_REASON.OTHERS,
          comment: "Order Revision from DIN",
          is_not_send_rabbitmq: true,
        }

        await this.orderStatusCancelModule.update(
          c,
          validationResult.orderIdToCancel,
          payloadCancel
        )
        console.log(
          `✅ [CANCEL] Order canceled - order_id: ${validationResult.orderIdToCancel}, doc_num: ${body.doc_num}`
        )
      }
    }

    // 1. Search Manufacture Materials
    const listMaterial = c.var.dataExtra?.listMaterial

    const manufactures = (
      await Promise.all(
        (listMaterial as WSMaterialSchema[]).map(async (material) =>
          this.repo.getWsMaterialManufacture(c, material.id, c.var.programId)
        )
      )
    ).filter(Boolean)

    // 2. validate Budget Source
    const [budgetSource] = await Promise.all([
      this.#findOrCreateBudgetSource(
        c,
        body.sumber_dana ? body.sumber_dana : "APBN"
      ),
    ])

    const inputData = this.#transformData(c, body, budgetSource, manufactures)

    // 3. Deliver to Module Central Delivery
    try {
      const orderId = await this.orderCentralDeliveryModule.create(c, inputData)
      console.log(
        `✅ [ORDER] Order created successfully - order_id: ${orderId}, doc_num: ${body.doc_num}`
      )
      Object.assign(c.var, { orderId })

      // Create log for HTTP context (worker has its own logging)
      if ("req" in c && c.req) {
        await this.createLog(
          c,
          c.var.client,
          "create_order",
          c.var.originalBody || body, // Gunakan originalBody jika ada
          {
            status: 200,
            body: {
              success: true,
              code: 200,
              message: c.var.validate || "Success post data",
            },
          },
          { orderId }
        )
        console.log(`📝 [LOG] Success log created for order_id: ${orderId}`)
      }
    } catch (error) {
      // Handle duplicate entry error (final guard)
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "ER_DUP_ENTRY" || error.code === "23505")
      ) {
        console.log(
          `ℹ️  [DUPLICATE] Order already exists (database constraint) - doc_num: ${body.doc_num}`
        )
        await this.createLog(
          c,
          c.var.client,
          "create_order",
          c.var.originalBody || body,
          {
            status: 409,
            body: `Order with doc_num ${body.doc_num} already exists`,
            error: { code: "ER_DUP_ENTRY" },
          }
        )
        return
      }

      console.error(
        `❌ [ORDER] Failed to create order - doc_num: ${body.doc_num}`
      )
      console.error(
        `   Error: ${error instanceof Error ? error.message : error}`
      )
      console.error(`   Stack: ${error instanceof Error ? error.stack : "N/A"}`)

      // Log failure
      await this.createLog(
        c,
        c.var.client,
        "create_order",
        c.var.originalBody || body,
        {
          status: 500,
          error: error,
        }
      )
      console.log(`📝 [LOG] Failure log created for doc_num: ${body.doc_num}`)

      throw error // Re-throw error to be handled by caller
    }
  }

  #transformData(
    c: DinContext,
    inputData: CreateOrderDinRequest,
    budgetSource,
    manufactures
  ) {
    const { dataExtra, client, dataClient } = c.var
    const { data, ...orderData } = inputData

    const getCurrentDate = (): string => {
      const today = new Date()
      return today.toISOString().split("T")[0]!
    }

    const getBudgetYear = (): number => {
      return new Date().getFullYear()
    }

    const findManufacture = (materialId: number): any => {
      return manufactures.find((m) => m.material_id === materialId)
    }

    const findMaterialByCode = (kfaCode: string) => {
      const materials = dataExtra?.listMaterial || []
      return materials.find((m) => m.code === kfaCode)
    }

    const materialGroups = new Map<number, OutputOrderItem>()

    data.forEach((item) => {
      const material = findMaterialByCode(item.kfa_code)
      const manufacture = material ? findManufacture(material.id) : undefined

      const isManagedInBatch = material
        ? material.is_managed_in_batch === 1
        : false
      const materialId = material ? material.id : 0

      const now = new Date()
      const stock: OutputStock = {
        ordered_qty: item.qty,
        budget_year: getBudgetYear(),
        budget_source_id: budgetSource.id,
        total_price: item.total_price,
        expired_date: isManagedInBatch
          ? item.tgl_kadaluarsa
            ? new Date(item.tgl_kadaluarsa!)
            : new Date("2100-01-01")
          : undefined,
        production_date: isManagedInBatch
          ? item.tgl_produksi
            ? new Date(item.tgl_produksi!)
            : new Date(now)
          : undefined,
        batch_code: isManagedInBatch
          ? item.lot_no ?? "N/A"
          : undefined,
        manufacture_name:
          isManagedInBatch && manufacture ? manufacture.name : undefined,
      }

      // Check if material already exists in the group
      if (materialGroups.has(materialId)) {
        materialGroups.get(materialId)!.stocks.push(stock)
        materialGroups.get(materialId)!.metadata.push(JSON.stringify(item))
      } else {
        materialGroups.set(materialId, {
          material_id: materialId,
          is_managed_in_batch: isManagedInBatch,
          stocks: [stock],
          metadata: [JSON.stringify(item)],
        })
      }
    })

    const orderItems: OutputOrderItem[] = Array.from(materialGroups.values())

    const currentDate = getCurrentDate()
    const orderDate = currentDate ? new Date(currentDate) : null
    const requiredDate = currentDate ? new Date(currentDate) : null

    return {
      vendor_id: dataExtra?.detailEntitasVendor?.id || 0,
      customer_id: dataExtra?.detailEntitasCustomer?.id || 0,
      activity_id: dataExtra?.activityId || 0,
      order_date: orderDate,
      required_date: requiredDate,
      order_comment: inputData.note || "From Din",
      po_number: inputData.ref_num,
      do_number: inputData.doc_num,
      delivery_type_id: 1,
      is_allocated: 1,
      metadata: JSON.stringify({
        client_key: dataClient?.key || client?.key,
        ...orderData,
      }),
      order_items: orderItems,
      batchCodeMapping: [],
    }
  }

  async #findOrCreateBudgetSource(c: DinContext, name: string) {
    const userId = c.var.user?.global_id || c.var.userId || 0
    const programId = c.var.programId || 0

    let budgetSource = await this.budgetSourceRepo.findOne(c, {
      name: name,
      program_id: programId,
    })

    if (!budgetSource) {
      // Create Budget Source
      const newBudgetSource = await this.repo.createBudgetSource(c, {
        name: name,
        description: null,
        created_by: userId,
        updated_by: userId,
      })

      // Create Budget Source Workspace
      await this.repo.createBudgetSourceWorkspace(c, {
        budget_source_id: Number(newBudgetSource.insertId),
        workspace_id: programId,
        status: 1,
      })

      budgetSource = await this.budgetSourceRepo.findOne(c, {
        name: name,
        program_id: programId,
      })
    }
    return budgetSource
  }

  #comparePayload(payloadOld: any, payloadNew: any): boolean {
    // Handle null/undefined cases
    if (payloadOld === null && payloadNew === null) return true
    if (payloadOld === null || payloadNew === null) return false
    if (payloadOld === undefined && payloadNew === undefined) return true
    if (payloadOld === undefined || payloadNew === undefined) return false

    // Handle primitive types
    if (typeof payloadOld !== "object" || typeof payloadNew !== "object") {
      return payloadOld === payloadNew
    }

    // Handle arrays
    if (Array.isArray(payloadOld) && Array.isArray(payloadNew)) {
      if (payloadOld.length !== payloadNew.length) return false

      for (let i = 0; i < payloadOld.length; i++) {
        if (!this.#comparePayload(payloadOld[i], payloadNew[i])) {
          return false
        }
      }
      return true
    }

    // If one is array and other is not
    if (Array.isArray(payloadOld) || Array.isArray(payloadNew)) {
      return false
    }

    // Handle objects - Get all keys from both objects
    const keysOld = Object.keys(payloadOld).sort((a, b) => a.localeCompare(b))
    const keysNew = Object.keys(payloadNew).sort((a, b) => a.localeCompare(b))

    // Check if number of keys are different
    if (keysOld.length !== keysNew.length) {
      return false
    }

    // Check if all keys match
    for (let i = 0; i < keysOld.length; i++) {
      if (keysOld[i] !== keysNew[i]) {
        return false
      }
    }

    // Check each key and value
    for (const key of keysOld) {
      const valueOld = payloadOld[key]
      const valueNew = payloadNew[key]

      if (!this.#comparePayload(valueOld, valueNew)) {
        return false
      }
    }

    return true
  }

  async #validatePayload(
    c: DinContext,
    bodyForValidation: any,
    body: CreateOrderDinRequest,
    existingOrder?: { id: number; order_status_id: number }
  ): Promise<
    { shouldCancel: boolean; orderIdToCancel: number | null } | string
  > {
    const doc_num = bodyForValidation.doc_num

    const integrationLog = await this.repo.getIntegrationLogByJson(c, doc_num)

    // Case 1: doc_num TIDAK ada di history → Langsung create order baru (tanpa cancel)
    if (!integrationLog || integrationLog.length === 0) {
      console.log(
        `✅ [VALIDATION] New order - doc_num: ${doc_num} (no history found)`
      )
      return { shouldCancel: false, orderIdToCancel: null }
    }

    // Case 2: doc_num ADA di history → Cek status dan payload
    const shippedLog = integrationLog.find(
      (il) => il.order_status_id === ORDER_STATUS.SHIPPED
    )
    if (shippedLog) {
      let payloadOld: any
      try {
        payloadOld =
          typeof shippedLog.body_content === "string"
            ? JSON.parse(shippedLog.body_content)
            : shippedLog.body_content
      } catch (error) {
        console.error("❌ [VALIDATION] Error parsing body_content:", error)
        payloadOld = shippedLog.body_content
      }

      const payloadNew = bodyForValidation

      // Normalisasi kedua payload: hapus field null untuk perbandingan yang adil
      const normalizedOld = this.#removeNullFields(payloadOld)
      const normalizedNew = this.#removeNullFields(payloadNew)

      const isSame = this.#comparePayload(normalizedOld, normalizedNew)

      if (isSame) {
        // Payload SAMA persis → Reject (order sudah shipped)
        await this.createLog(
          c,
          c.var.client,
          "create_order",
          c.var.originalBody || body,
          {
            status: 400,
            body: `Order has been shipped by SMILE with order ID: ${shippedLog.id}`,
            error: { existing_order_id: shippedLog.id },
          }
        )

        return `Order has been shipped by SMILE with order ID: ${shippedLog.id}`
      } else {
        // Payload BEDA → Cancel order lama, lalu create order baru
        console.log(
          `⚠️  [VALIDATION] Payload different - doc_num: ${doc_num}, order_id: ${shippedLog.id}`
        )
        return { shouldCancel: true, orderIdToCancel: shippedLog.id }
      }
    }

    const fulfilledLog = integrationLog.find(
      (il) => il.order_status_id === ORDER_STATUS.FULFILLED
    )
    if (fulfilledLog) {
      // Order sudah received → Reject
      await this.createLog(
        c,
        c.var.client,
        "order",
        c.var.originalBody || body,
        {
          status: 400,
          body: `Order has been received by SMILE with order ID: ${fulfilledLog.id}`,
          error: { existing_order_id: fulfilledLog.id },
        }
      )

      return `Order has been received by SMILE with order ID: ${fulfilledLog.id}`
    }

    const canceledLog = integrationLog.find(
      (il) => il.order_status_id === ORDER_STATUS.CANCELED
    )
    if (canceledLog) {
      // Order sudah canceled → Reject
      await this.createLog(
        c,
        c.var.client,
        "order",
        c.var.originalBody || body,
        {
          status: 400,
          body: `Order has been canceled by SMILE with order ID: ${canceledLog.id}`,
          error: { existing_order_id: canceledLog.id },
        }
      )

      return `Order has been canceled by SMILE with order ID: ${canceledLog.id}`
    }

    // Default: doc_num ada tapi tidak ada status shipped/fulfilled/canceled
    // Check if existing order is provided (order exists but not in final state)
    if (existingOrder) {
      // Order exists in pending/processing state - check if payload is different
      const latestLog = integrationLog[0] // Get the most recent log
      if (latestLog) {
        let payloadOld: any
        try {
          payloadOld =
            typeof latestLog.body_content === "string"
              ? JSON.parse(latestLog.body_content)
              : latestLog.body_content
        } catch (error) {
          console.error("❌ [VALIDATION] Error parsing body_content:", error)
          payloadOld = latestLog.body_content
        }

        const payloadNew = bodyForValidation
        const normalizedOld = this.#removeNullFields(payloadOld)
        const normalizedNew = this.#removeNullFields(payloadNew)
        const isSame = this.#comparePayload(normalizedOld, normalizedNew)

        if (isSame) {
          // Payload sama → Order sedang diproses dengan data yang sama, reject
          console.log(
            `ℹ️  [VALIDATION] Order is being processed with same payload - doc_num: ${doc_num}, order_id: ${existingOrder.id}`
          )
          return `Order is being processed with doc_num ${doc_num}`
        } else {
          // Payload beda → Cancel order lama, lalu create order baru
          console.log(
            `⚠️  [VALIDATION] Payload different (order in progress) - doc_num: ${doc_num}, order_id: ${existingOrder.id}`
          )
          return { shouldCancel: true, orderIdToCancel: existingOrder.id }
        }
      }

      // No log found but order exists (edge case) → Cancel existing order
      return { shouldCancel: true, orderIdToCancel: existingOrder.id }
    }

    // No existing order and no shipped/fulfilled/canceled log → Create order baru
    return { shouldCancel: false, orderIdToCancel: null }
  }

  #removeNullFields(obj: any): any {
    if (obj === null || obj === undefined) return null
    if (typeof obj !== "object") return obj

    if (Array.isArray(obj)) {
      return obj.map((item) => this.#removeNullFields(item))
    }

    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === null) {
        // Skip null fields
        continue
      }
      result[key] = this.#removeNullFields(value)
    }
    return result
  }

  async login(c: Context, req: z.infer<typeof LoginRequestSchema>) {
    const loginResp = await this.authRepo.login(req.username, req.password)

    return {
      access_token: loginResp.authDetails.access_token,
      token_type: "bearer",
      expires_in: loginResp.authDetails.expires_in / 60,
    }
  }
}
