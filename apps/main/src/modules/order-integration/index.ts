import { db } from "@/common/infrastructure/database/index.js"
import { getConnection } from "@/common/infrastructure/mq/index.js"
import { TransactionManager } from "@smile-health/lib/database.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { env } from "process"
import { OrderIntegrationRepository } from "./order-integration.repository.js"
import { OrderIntegrationWorker } from "./order-integration.worker.js"

const trxManager = new TransactionManager(db)
const consumer = new Consumer(
  getConnection,
  trxManager,
  `${env.APP_NAME}-queue`,
  false
)

const integrationRepo = new OrderIntegrationRepository()

const orderIntegrationWorker = new OrderIntegrationWorker(integrationRepo)
orderIntegrationWorker.registerWorkers(consumer)

// Start consumer
console.log("🚀 [OrderIntegration] Starting consumer...")
consumer.start()
console.log("✅ [OrderIntegration] Consumer started")

export { consumer }
