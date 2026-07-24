import { toast } from '#components/toast'
import { listStockDetailStock } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { Stock } from '#types/stock'
import { AxiosError } from 'axios'
import {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'

import {
  formatDetailBatch,
  isSelectedStock,
  mapDetails,
  mapStock,
} from '../order-create-distribution.helper'
import {
  TOrderFormItemsDetailValues,
  TOrderFormValues,
} from '../order-create-distribution.type'

type Params = {
  append: UseFieldArrayAppend<TOrderFormValues>
  remove: UseFieldArrayRemove
}

export default function useMaterialStockDetails(params: Params) {
  const { append, remove } = params
  const { setLoadingPopup } = useLoadingPopupStore()

  const { watch } = useFormContext<TOrderFormValues>()

  const { vendor, order_items, activity } = watch()
  const selectedMaterial = order_items?.map(
    (item) => item?.material?.id
  ) as number[]

  async function handleAddItem(stock: Stock) {
    setLoadingPopup(true)

    try {
      if (stock?.total_available_qty || stock?.aggregate?.total_available_qty) {
        const { data } = await listStockDetailStock({
          group_by: 'activity',
          entity_id: vendor?.value,
          material_id: stock?.material?.id,
          only_have_qty: 1,
        })

        const piecesPerUnit =
          stock?.material?.consumption_unit_per_distribution_unit
        const mappedStock = mapStock(stock)
        const details = mapDetails(data) as TOrderFormItemsDetailValues[]
        const formattedDetail = formatDetailBatch(
          details,
          activity?.value,
          piecesPerUnit
        )

        append({
          ...mappedStock,
          ...formattedDetail,
        })
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error?.response?.data?.message
        toast.danger({ description: message })
      }
    } finally {
      setLoadingPopup(false)
    }
  }

  function handleRemoveItem(material_id: number) {
    const index = order_items?.findIndex(
      (item) => item?.material?.id === material_id
    )
    remove(index)
  }

  function handleClickTableRow(stock: Stock) {
    if (stock?.material?.id) {
      if (isSelectedStock(stock?.material?.id, selectedMaterial)) {
        handleRemoveItem(stock?.material?.id)
      } else {
        handleAddItem(stock)
      }
    }
  }

  return {
    handleAddItem,
    handleRemoveItem,
    handleClickTableRow,
  }
}
