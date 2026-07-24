import { CommitmentMonitoringExcel } from "@/modules/monitoring/commitment/commitment.excel.js"
import { CommitmentMonitoringModule } from "@/modules/monitoring/commitment/commitment.module.js"
import { CommitmentQuery } from "@/modules/monitoring/commitment/commitment.query.js"
import { CommitmentRepository } from "@/modules/monitoring/commitment/commitment.repository.js"

export const sendQuarterlyNeedsEmail = async () => {
  const commitmentQuery = new CommitmentQuery()
  const commitmentRepo = new CommitmentRepository(commitmentQuery)
  const commitmentExcel = new CommitmentMonitoringExcel()
  const commitmentModule = new CommitmentMonitoringModule(
    commitmentRepo,
    commitmentExcel
  )

  try {
    await commitmentModule.sendQuarterlyNeedsEmail()

    console.log("✅ Process finished - Send Quarterly Needs Email")
    process.exit(0)
  } catch (error) {
    console.error("❌ Process failed - Send Quarterly Needs Email", error)
    process.exit(1)
  }
}
