import { parseDateTime } from '#utils/date'
import { useFormContext } from 'react-hook-form'

import { NewOpnameStocks, StockOpnameCreateForm, StockOpnameDetailStock } from '../types'

export const useStockOpnameAddMaterial = () => {
  const {
    watch,
    setValue,
    clearErrors
  } = useFormContext<StockOpnameCreateForm>()
  const { new_opname_items } = watch()

  const handleChooseMaterial = (value: StockOpnameDetailStock, selectedIndex: number) => {
    if (selectedIndex === -1) {
      let new_opname_stocks: NewOpnameStocks[] = []
      let is_batch = !!value.material?.is_managed_in_batch

      value.stocks.forEach(stock => {
        new_opname_stocks.push({
          id: stock.id,
          activity: stock.activity,
          batch: !is_batch ? null : {
            id: stock.batch?.id || null,
            code: stock.batch?.code || '',
            expired_date: stock.batch?.expired_date || '',
            production_date: stock.batch?.production_date || '',
            manufacture: {
              id: stock.batch?.manufacture?.id || null,
              name: stock.batch?.manufacture?.name || '',
              address: stock.batch?.manufacture?.address || '',
            }
          },
          in_transit_qty: stock.unreceived_qty,
          material_id: value.material?.id || 0,
          pieces_per_unit: value.material?.consumption_unit_per_distribution_unit || 1,
          recorded_qty: stock.qty,
        })
      })

      new_opname_stocks = new_opname_stocks.sort((a, b) => (b.in_transit_qty + b.recorded_qty) - (a.in_transit_qty + a.recorded_qty))

      const opnameItems = [
        ...(new_opname_items || []),
        {
          material_id: value.material?.id || 0,
          material: value.material,
          parent_material: value.parent_material,
          total_available_qty: value.total_qty ?? 0,
          new_opname_stocks,
          is_batch,
          last_opname_date: value.last_opname_date ?? null,
        },
      ]
      setValue('new_opname_items', opnameItems)
      clearErrors('new_opname_items')
    } else {
      const newData = [...new_opname_items]
      newData.splice(selectedIndex, 1)

      setValue('new_opname_items', newData)
      clearErrors('new_opname_items')
    }
  }

  return {
    handleChooseMaterial,
  }
}
