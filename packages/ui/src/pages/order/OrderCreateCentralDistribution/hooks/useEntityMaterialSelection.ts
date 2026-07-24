import { Stock } from '#types/stock'
import {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'

import { defaultStock } from '../order-create-central-distribution.constant'
import {
  isSelectedStock,
  mapMaterial,
} from '../order-create-central-distribution.helper'
import { TOrderFormValues } from '../order-create-central-distribution.type'

type Params = {
  append: UseFieldArrayAppend<TOrderFormValues>
  remove: UseFieldArrayRemove
}

export default function useEntityMaterialSelection(params: Params) {
  const { append, remove } = params

  const { watch } = useFormContext<TOrderFormValues>()

  const { order_items } = watch()
  const selectedMaterial = order_items?.map((item) => item?.id) as number[]

  function handleAddItem(item: Stock) {
    const material = mapMaterial(item)

    const stocks = !material?.is_managed_in_batch ? defaultStock : []

    append({
      ...material,
      stocks,
    })
  }

  function handleRemoveItem(material_id: number) {
    const index = order_items?.findIndex((item) => item?.id === material_id)
    remove(index)
  }

  function handleClickTableRow(material: Stock) {
    if (material?.material?.id) {
      if (isSelectedStock(material?.material?.id, selectedMaterial)) {
        handleRemoveItem(material?.material?.id)
      } else {
        handleAddItem(material)
      }
    }
  }

  return {
    handleAddItem,
    handleRemoveItem,
    handleClickTableRow,
  }
}
