import { DB } from "@/common/infrastructure/database/types/db.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { Context } from "hono"
import { BaseWorker } from "../base.worker.js"
import { AssetMonitoringDeviceModule } from "./asset-monitoring-device.module.js"
import { GetAssetMonitoringDevicesQueryParams } from "./asset-monitoring-device.schema.js"

export class AssetMonitoringDeviceWorker extends BaseWorker {
  constructor(private module: AssetMonitoringDeviceModule) {
    super()
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.ASSET_MONITORING_DEVICE_EXPORTED, async (c, msg) => {
      const parseMsg = JSON.parse(msg ?? "{}")
      const { params, options } = parseMsg.payload

      await this.processAsyncExport(c, options, async () => {
        return await this.module.export(
          c as unknown as Context,
          params as GetAssetMonitoringDevicesQueryParams
        )
      })
    })
  }
}
