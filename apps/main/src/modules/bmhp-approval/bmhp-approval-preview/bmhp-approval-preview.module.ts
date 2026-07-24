import { Context } from "hono"
import { PaginatedResponse } from "@smile/lib/types/paginate.js"
import momentTZ from "moment-timezone"
import { BmhpApprovalPreviewRepository } from "./bmhp-approval-preview.repository.js"
import { GetPreviewQuery } from "./bmhp-approval-preview.schema.js"
import { buildPreviewExcel } from "./bmhp-approval-preview.excel.js"

export class BmhpApprovalPreviewModule {
  constructor(private readonly repository: BmhpApprovalPreviewRepository) {}

  async list(c: Context, query: GetPreviewQuery) {
    const { list: allRows, total } = await this.repository.findWithPagination(c, query)

    const paginate = query.paginate ?? 10
    const page = query.page ?? 1
    const offset = (page - 1) * paginate
    const list = allRows.slice(offset, offset + paginate)

    return new PaginatedResponse({ ...query, paginate, page }, list, total)
  }

  async exportExcel(c: Context, query: GetPreviewQuery) {
    const timezone = c.req.header("Timezone") || "UTC"
    const currentTime = momentTZ().tz(timezone)
    const formatDate =
      currentTime.format("DD-MMM-YYYY HH_mm_ss").toUpperCase() +
      " GMT" +
      currentTime.format("Z").replace(":00", "")
    const filename = `BmhpApprovalPreview_${currentTime.format("YYYYMMDD_HHmm")} ${formatDate}_en`

    const { list } = await this.repository.findWithPagination(c, {
      ...query,
      paginate: 999999,
      page: 1,
    })
    return buildPreviewExcel(list, filename)
  }
}
