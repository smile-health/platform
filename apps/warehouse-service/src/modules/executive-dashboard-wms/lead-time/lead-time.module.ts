import { Context } from "hono"
import { LeadTimeRepository } from "./lead-time.repository.js"
import { LeadTimeQueryParams, LeadTimeResponse, LeadTimeStage } from "./lead-time.schema.js"
import {
  buildMapsData,
  buildMonthlyComparison,
  buildMost10Delivery,
  roundToOneDecimal,
} from "./lead-time.util.js"

export class LeadTimeModule {
  constructor(private readonly repository: LeadTimeRepository) {}

  private getTooltipTitle(c: Context, stage?: LeadTimeStage): Record<string, string> {
    const stageHandlerKeyMap: Record<LeadTimeStage, string> = {
      avg_pickup: "lead_time.tooltip.handler.avg_pickup",
      avg_process: "lead_time.tooltip.handler.avg_process",
      avg_landfill: "lead_time.tooltip.handler.avg_landfill",
      avg_recycle: "lead_time.tooltip.handler.avg_recycle",
    }
    const stageActionKeyMap: Record<LeadTimeStage, string> = {
      avg_pickup: "lead_time.tooltip.action.avg_pickup",
      avg_process: "lead_time.tooltip.action.avg_process",
      avg_landfill: "lead_time.tooltip.action.avg_landfill",
      avg_recycle: "lead_time.tooltip.action.avg_recycle",
    }
    const stageKeyMap: Record<LeadTimeStage, string> = {
      avg_pickup: "lead_time.tooltip.avg_pickup",
      avg_process: "lead_time.tooltip.avg_process",
      avg_landfill: "lead_time.tooltip.avg_landfill",
      avg_recycle: "lead_time.tooltip.avg_recycle",
    }

    const selectedStage = stage ?? "avg_pickup"
    return {
      exist: c.var.t(stageKeyMap[selectedStage]),
      empty: c.var.t("lead_time.tooltip.zero_data", {
        handler: c.var.t(stageHandlerKeyMap[selectedStage]),
        action: c.var.t(stageActionKeyMap[selectedStage]),
      }),
    }
  }

  async getLeadTimeData(
    c: Context,
    queryParams: LeadTimeQueryParams
  ): Promise<LeadTimeResponse> {
    const { province_id, stages, entity_tag_id } = queryParams
    const provinceIdStr = province_id?.toString()
    const entityTagIdStr = entity_tag_id?.toString()

    const [mapData, monthlyData, top10Data, lastUpdated] = await Promise.all([
      this.repository.fetchMapData(c, provinceIdStr, stages, entityTagIdStr),
      this.repository.fetchMonthlyComparison(c, provinceIdStr, stages, entityTagIdStr),
      this.repository.fetchTop10Delivery(c, provinceIdStr, stages, entityTagIdStr),
      this.repository.getLastUpdate(c),
    ])

    const tooltipTitle = this.getTooltipTitle(c, stages)
    const maps = buildMapsData(mapData, tooltipTitle, provinceIdStr)
    const { monthlyComparison } = buildMonthlyComparison(monthlyData)
    const avg = maps.dataset.length > 0
      ? maps.dataset.reduce((sum, item) => sum + item.value, 0) / maps.dataset.length
      : 0
    const most_10_delivery = buildMost10Delivery(top10Data)

    return {
      last_updated: lastUpdated,
      data: {
        maps,
        avg: roundToOneDecimal(avg),
        monthly_comparison: monthlyComparison,
        most_10_delivery,
      },
    }
  }
}
