import { db } from "@/common/infrastructure/database/index.js"
import { BiofarmaCron } from "@/modules/order-integration/biofarma/biofarma.cron.js"
import { BiofarmaGateway } from "@/modules/order-integration/biofarma/biofarma.gateway.js"
import { BiofarmaRepository } from "@/modules/order-integration/biofarma/biofarma.repository.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"
import { Context } from "hono"

const trxManager = new TransactionManager(db)

export const syncBiofarmaOrders = async (
  type: "hub" | "province",
  startDate: string,
  endDate: string
) => {
  await trxManager.transaction(async (trx) => {
    const c = new CustomContext({
      trx,
      t: i18n.t,
      "feature-flags": (key: string, defaultValue: unknown) => defaultValue,
      "feature-enabled": () => false,
    })
    const client = await trx
      .selectFrom("integration_clients")
      .selectAll()
      .where("key", "=", "biofarma")
      .executeTakeFirstOrThrow()

    const cronHandler = new BiofarmaCron(
      new BiofarmaRepository(),
      new BiofarmaGateway(client)
    )

    await cronHandler.syncOrders(c as Context, type, startDate, endDate)
  })

  process.exit(0)
}

export const syncBiofarmaDashboard = async (
  type: "hub" | "province",
  startDate: string,
  endDate: string
) => {
  await trxManager.transaction(async (trx) => {
    const client = await trx
      .selectFrom("integration_clients")
      .selectAll()
      .where("key", "=", "biofarma")
      .executeTakeFirstOrThrow()

    const c = new CustomContext({
      trx,
      t: i18n.t,
      "feature-flags": (key: string, defaultValue: unknown) => defaultValue,
      "feature-enabled": () => false,
    }) as Context

    const cronHandler = new BiofarmaCron(
      new BiofarmaRepository(),
      new BiofarmaGateway(client)
    )

    await cronHandler.syncDashboard(c, type, startDate, endDate)
  })
  process.exit(0)
}
