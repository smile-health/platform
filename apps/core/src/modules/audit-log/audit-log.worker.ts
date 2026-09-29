import { DB } from "@/common/infrastructure/database/types/db.js"
import { logger } from "@smile-health/lib/logger.js"
import { Consumer } from "@smile-health/lib/rabbitmq/consumer.js"
import { TOPIC } from "@smile-health/lib/rabbitmq/topic.js"
import { BaseWorker } from "../base.worker.js"
import { AuditLogRepository } from "./audit-log.repository.js"
import { CreateAuditLogInput } from "./audit-log.schema.js"

export class AuditLogWorker extends BaseWorker {
  constructor(private readonly repository: AuditLogRepository) {
    super()
  }

  public registerWorkers(consumer: Consumer<DB>) {
    consumer.route(TOPIC.AUDIT_LOG_CREATED, async (c, msg) => {
      const parsed = JSON.parse(msg ?? "{}")
      const payload = parsed.payload as CreateAuditLogInput | undefined

      if (!payload || !payload.action || !payload.module) {
        logger.warn(
          "audit-log: dropping malformed payload (missing action/module)"
        )
        return
      }

      await this.repository.create(c, payload)
    })
  }
}
