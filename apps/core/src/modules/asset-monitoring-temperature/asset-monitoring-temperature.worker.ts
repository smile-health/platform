import { DB } from "@/common/infrastructure/database/types/db.js"
import { Consumer } from "@smile/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile/lib/rabbitmq/topic.js"
import { Context } from "hono"
import { BaseWorker } from "../base.worker.js"
import { AssetMonitoringTemperatureModule } from "./asset-monitoring-temperature.module.js"
import {
  GetAssetMonitoringTemperatureQuery,
  GetTemperatureHistoryQueries,
} from "./asset-monitoring-temperature.schema.js"

export class AssetMonitoringTemperatureWorker extends BaseWorker {
  constructor(private module: AssetMonitoringTemperatureModule) {
    super()
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(
      TOPIC.ASSET_MONITORING_TEMPERATURE_EXPORTED,
      async (c, msg) => {
        const parseMsg = JSON.parse(msg ?? "{}")
        const { params, options } = parseMsg.payload

        await this.processAsyncExport(c, options, async () => {
          return await this.module.exportAssetMonitoringTemperatureList(
            c as unknown as Context,
            params as GetAssetMonitoringTemperatureQuery
          )
        })
      }
    )

    consumer.route(
      TOPIC.ASSET_MONITORING_TEMPERATURE_HISTORY_EXPORTED,
      async (c, msg) => {
        const parseMsg = JSON.parse(msg ?? "{}")
        const { params, options } = parseMsg.payload
        const { rtmdId, ...restParams } = params

        await this.processAsyncExport(c, options, async () => {
          return await this.module.exportTemperatureHistoryByRtmdId(
            c as unknown as Context,
            rtmdId as number,
            restParams as GetTemperatureHistoryQueries
          )
        })
      }
    )
  }
}
