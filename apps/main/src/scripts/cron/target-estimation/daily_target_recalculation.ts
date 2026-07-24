import { db } from "@/common/infrastructure/database/index.js"
import { TargetEstimationRepository } from "@/modules/microplanning/target-estimation/target-estimation.repository.js"
import { TargetEstimationCron } from "@/modules/microplanning/target-estimation/target-estimation.cron.js"
import { TargetsRepository } from "@/modules/microplanning/targets/targets.repository.js"
import { TransactionManager } from "@smile/lib/database.js"
import i18n from "@smile/lib/i18n.js"
import { CustomContext } from "@smile/lib/types/context.js"

export const dailyTargetRecalculation = async () => {
  const targetEstimationCron = new TargetEstimationCron(
    new TargetsRepository(),
    new TargetEstimationRepository()
  )

  await new TransactionManager(db).transaction(async (trx) => {
    const translator = i18n.cloneInstance()
    translator.changeLanguage("id")
    const c = new CustomContext({
      trx,
      t: translator.t,
      "feature-enabled": () => false,
      "feature-flags": () => false,
    })

    await targetEstimationCron.handleRecalculateTargets(c)
  })
  process.exit(0)
}
