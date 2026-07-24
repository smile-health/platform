import { DB } from "@/common/infrastructure/database/types/db.js"
import { BaseWorker } from "@/modules/base.worker.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { DinModule } from "./din.module.js"
import { DinMiddleware } from "./din.middleware.js"
import { DinContext } from "./din.context.js"
import { CreateOrderDinRequest } from "./din.schemas.js"

export class DinWorker extends BaseWorker {
  constructor(
    private readonly dinModule: DinModule,
    private readonly dinMiddleware: DinMiddleware
  ) {
    super()
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.ORDER_CREATED_FROM_DIN, async (c, msg) => {
      // Declare variables outside try-catch to be accessible in catch block
      let parsed: any
      let ctx: DinContext
      let data: CreateOrderDinRequest | undefined
      let client: any
      let payload: { data: CreateOrderDinRequest } | undefined

      try {
        // Parse message dari RabbitMQ
        parsed = JSON.parse(msg ?? "{}")

        const parsedData = parsed as {
          payload: { data: CreateOrderDinRequest }
          user: any
          client: any
          program_id: number
          requestUrl?: string
        }

        payload = parsedData.payload
        client = parsedData.client

        ctx = c as DinContext

        const userId = parsedData.user?.id || 0
        Object.assign(ctx.var, {
          programId: parsedData.program_id,
          userId: userId,
          user: parsedData.user,
          client: client,
          requestUrl: parsedData.requestUrl,
        })

        if (!("get" in ctx)) {
          Object.assign(ctx, {
            get: (key: string) => ctx.var[key as keyof typeof ctx.var],
            set: (key: string, value: any) => {
              ;(ctx.var as any)[key] = value
            },
          })
        }

        data = payload?.data

        if (!data) {
          console.error("❌ [DinWorker] No data in payload")
          return
        }

        // Simpan original payload SEBELUM di-mix dengan dataExtra untuk logging
        const originalPayload = { ...data }

        console.log("✅ [DinWorker] Memulai prepare dataExtra...")

        // Step 1: Prepare dataExtra dari payload (query ulang)
        const dataExtra = await this.dinMiddleware.prepareDataExtra(
          ctx,
          data,
          client,
          parsedData.program_id
        )

        // Set dataExtra ke context agar bisa digunakan oleh DinModule
        Object.assign(ctx.var, {
          dataExtra: {
            activityId: dataExtra.activityId,
            detailEntitasVendor: { id: dataExtra.vendorId } as any,
            detailEntitasCustomer: { id: dataExtra.customerId } as any,
            listMaterial: dataExtra.listMaterial,
          },
          activityIds: dataExtra.activityIds || [parsedData.program_id],
          originalPayload, // Simpan original payload untuk logging
        })

        const resultData = {
          ...data,
          ...dataExtra,
        }

        // Step 2: Call DinModule.post untuk memproses data
        await this.dinModule.post(ctx, resultData, client)

        console.log("✅ [DinWorker] Selesai memproses data")

        // Log order creation success
        const { orderId } = ctx.var
        if (orderId) {
          console.log(
            `✅ [DinWorker] Order created successfully - order_id: ${orderId}, doc_num: ${data.doc_num}`
          )
          // Create log entry in database dengan format yang sama seperti HTTP
          // Gunakan originalPayload untuk logging, bukan data yang sudah ter-mix
          await this.dinModule.createLog(
            ctx,
            client,
            "create_order",
            ctx.var.originalPayload || data,
            {
              status: 200,
              body: {
                success: true,
                code: 200,
                message: "Success post data",
              },
            },
            { orderId }
          )
          console.log(
            `📝 [DinWorker] Success log created for order_id: ${orderId}`
          )
        } else {
          console.warn(
            `⚠️  [DinWorker] Order ID not set after processing - doc_num: ${data.doc_num}`
          )
        }
      } catch (error) {
        console.error(
          `❌ [DinWorker] Error processing message - doc_num: ${data?.doc_num || "N/A"}`
        )
        console.error(
          `   Error: ${error instanceof Error ? error.message : error}`
        )
        console.error(
          `   Stack: ${error instanceof Error ? error.stack : "N/A"}`
        )

        // Log failure - gunakan originalPayload untuk logging
        await this.dinModule.createLog(
          ctx!,
          client,
          "create_order_failed_worker",
          ctx.var.originalPayload || payload?.data || {},
          {
            status: 500,
            error: error,
          }
        )
        console.log(
          `📝 [DinWorker] Failure log created for doc_num: ${data?.doc_num || "N/A"}`
        )

        throw error
      }
    })
  }
}
