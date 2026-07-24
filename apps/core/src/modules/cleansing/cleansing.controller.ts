import { BaseController } from "@smile/lib/base/controller"
import { Hono } from "hono"
import { CleansingModule } from "./cleansing.module"
import { CleansingMiddleware } from "./cleansing.middleware"

export class CleansingController extends BaseController {
  constructor(
    private readonly module: CleansingModule,
    private readonly midleware: CleansingMiddleware
  ) {
    super()
  }

  public getRoutes(): Hono {
    const router = new Hono()

    router.post(
      "/switch-transaction-entity",
      this.validateRequest(
        "json",
        this.midleware.switchTransactionEntity.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.switchTransactionEntity(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/merge-transaction-entities",
      this.validateRequest(
        "json",
        this.midleware.switchTransactionEntity.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.mergeTransactionEntities(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleanse-unreceived-qty",
      this.validateRequest(
        "json",
        this.midleware.cleanseUnreceivedQty.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.cleanseUnreceivedQty(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleanse-transactions",
      this.validateRequest(
        "json",
        this.midleware.cleanseTransactions.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.bulkCleanseTransactions(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleanse-transaction-is-not-vendor",
      this.validateRequest(
        "json",
        this.midleware.cleanseTransactionsIsNotVendor.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.cleanseTransactionIsNotVendor(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleanse-stock-opname",
      this.validateRequest(
        "json",
        this.midleware.cleanseStockOpname.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.cleanseStockOpname(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleanse-add-and-remove-stock",
      this.validateRequest(
        "json",
        this.midleware.cleanseAddAndRemoveStock.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.bulkCleanseAddAndRemoveStock(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    router.post(
      "/cleaning-up-unallocated-inventory",
      this.validateRequest(
        "json",
        this.midleware.cleaningUpUnallocatedInventory.bind(this.midleware)
      ),
      async (c) => {
        const result = await this.module.cleaningUpUnallocatedInventory(
          c,
          c.req.valid("json")
        )
        return c.json(result)
      }
    )

    return router
  }
}
