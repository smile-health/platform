import dayjs from 'dayjs'

import {
  CreateStockOpnameBody,
  ItemsOpnameBody,
  StockOpnameBody,
  StockOpnameCreateForm,
} from '../types'

const formatToDateOnly = (input: string) => {
  const formats = ['YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD']
  const parsed = dayjs(input, formats, true) // strict parsing

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : ''
}

export const createBodyPayload = (
  values: StockOpnameCreateForm
): CreateStockOpnameBody => {
  const items: ItemsOpnameBody[] = []

  values.new_opname_items.forEach((item) => {
    const stocks: StockOpnameBody[] = []

    item.new_opname_stocks.forEach((stock) => {
        stocks.push({
          activity_id: stock.activity.id,
          expired_date: formatToDateOnly(stock.batch?.expired_date ?? ''),
          batch_code: stock.batch?.code ?? '',
          actual_qty: stock.actual_qty || 0,
          recorded_qty: stock.recorded_qty,
          in_transit_qty: stock.in_transit_qty,
          stock_id: stock?.id || null,
        })
      })

    items.push({
      material_id: item.material_id,
      stocks,
    })
  })

  return {
    entity_id: values.entity?.value,
    period_id: values.periode?.value,
    items,
  }
}

export const getTodayDate = (): Date => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
