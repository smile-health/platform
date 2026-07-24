import { DB } from "@/common/infrastructure/database/types/db.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { BaseWorker } from "../base.worker.js"
import { AssetInventoryModule } from "./asset-inventory.module.js"
import { Context } from "hono"

export class AssetInventoryWorker extends BaseWorker {
  constructor(private module: AssetInventoryModule) {
    super()
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.ASSET_INVENTORY_EXPORTED, async (c, msg) => {
      const parseMsg = JSON.parse(msg ?? "{}")
      const { params, options } = parseMsg.payload

      await this.processAsyncExport(c, options, async () => {
        return await this.module.export(c as Context, params)
      })
    })
  }
}
