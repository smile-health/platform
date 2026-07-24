import moment from "moment"
import {
  ReconciliationBarReportDTO,
  ReconciliationEntityReportDTO,
  ReconciliationEntityReportResponseDataSchema,
} from "./reconciliation.schema.js"
import { EntityDTO } from "../entity/entity.schema.js"
import { z } from "zod"

export function generatePeriodIntervals(
  start_date: string,
  end_date: string
): string[] {
  const periods: string[] = []
  const current = moment(start_date).startOf("month")
  const end = moment(end_date).startOf("month")

  while (current.isSameOrBefore(end)) {
    periods.push(current.format("YYYY-MM"))
    current.add(1, "month")
  }

  return periods
}

export function leadZeroNumber(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

export function formatDecimal(num: number, decimalPlaces: number = 2): number {
  return parseFloat(num.toFixed(decimalPlaces))
}

export function formatBarData({
  reconByMonth,
  periods,
}: {
  reconByMonth: ReconciliationBarReportDTO
  periods: string[]
  lang?: string
}) {
  const intervalPeriod: string[] = []
  const column: { label: string }[] = []
  const overview: { label: string; value: number }[] = []

  periods.forEach((period) => {
    const [year, month] = period.split("-").map(Number)
    const data = reconByMonth.find(
      (el) => el.year === year && el.month === month
    )

    const col = moment(period).format("MMM YYYY")

    intervalPeriod.push(period)
    column.push({ label: col })
    overview.push({
      label: period,
      value: data?.value || 0,
    })
  })

  return {
    intervalPeriod,
    data: overview,
    column,
    subColumn: ["value"],
  }
}

export function formatListEntityRecon({
  entities,
  reconciliations,
  periods,
}: {
  entities: EntityDTO
  reconciliations: ReconciliationEntityReportDTO
  periods: string[]
  lang?: string
}): {
  list: z.infer<typeof ReconciliationEntityReportResponseDataSchema>
  intervalPeriod: string[]
} {
  const overviews: Record<string, number> = {}
  const intervalPeriod: string[] = []

  periods.forEach((period) => {
    overviews[period] = 0
    intervalPeriod.push(period)
  })

  const listEntity: z.infer<
    typeof ReconciliationEntityReportResponseDataSchema
  > = []

  entities.forEach((entity) => {
    const overviewPerEntity = JSON.parse(JSON.stringify(overviews))
    let total = 0

    reconciliations
      .filter((el) => el.entity_id === entity.id)
      .forEach((el) => {
        const period = `${el.year}-${leadZeroNumber(el.month)}`
        total += el.value
        if (Object.prototype.hasOwnProperty.call(overviewPerEntity, period)) {
          overviewPerEntity[period] = el.value ?? 0
        }
      })

    listEntity.push({
      id: entity.id,
      name: entity.name,
      total: total,
      average: formatDecimal(total / periods.length),
      months: overviewPerEntity,
    })
  })

  return {
    list: listEntity,
    intervalPeriod,
  }
}
