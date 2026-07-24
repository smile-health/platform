import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { useFormContext } from 'react-hook-form'

import { listStockDetailStock } from '../../transaction-create.service'
import {
  CreateTransactionAddStock,
} from '../transaction-add-stock.type'
import { setIntialBatch } from '../utils/helpers'

export const useTransactionCreateAddStock = () => {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTransactionAddStock>()
  const { items, entity, activity, transactionType } = watch()

  const { setLoadingPopup } = useLoadingPopupStore()

  const addEmptyStock = ({ item }: { item: Stock }) => {
    const copyItems = items
      ? ([...items] as CreateTransactionAddStock['items'])
      : []
    const newStock = {
      material_id: item?.material?.id,
      material_name: item?.material?.name,
      available_stock: 0,
      on_hand_stock: 0,
      min: 0,
      max: 0,
      managed_in_batch: item?.material?.is_managed_in_batch,
      change_qty: undefined,
      transaction_reason: undefined,
      other_reason: '',
      other_reason_required: false,
      transaction_type_id: transactionType?.value,
      is_openvial: item?.material?.is_open_vial,
      temperature_sensitive: item?.material?.is_temperature_sensitive,
      pieces_per_unit: item?.material?.consumption_unit_per_distribution_unit,
      stock_id: undefined,
      unit: item?.material?.unit_of_consumption,
      batches: [],
    }
    copyItems.push(newStock)
    setValue('items', copyItems)
  }

  const handleAddItemAddStock = async ({ item }: { item: Stock }) => {
    setLoadingPopup(true)
    try {
      const selectedMaterialIds = items?.map((obj) => obj.material_id) || []
      if (selectedMaterialIds.includes(item.material?.id)) return

      const { data } = await listStockDetailStock({
        group_by: 'activity',
        entity_id: entity?.value,
        material_id: item.material?.id,
      })

      if (!data?.length) return addEmptyStock({ item })

      const inComingStock = data
        .filter((itmObj) => itmObj.activity?.id === activity?.value)
        .map((itemStock) => {
          const materialItemList =
            itemStock.stocks?.filter(
              (stk) => Number(stk.activity?.id) === Number(activity?.value)
            ) || []

          const managed_in_batch = item.material?.is_managed_in_batch
          const stockId =
            managed_in_batch === 1 || materialItemList.length > 0
              ? materialItemList[0]?.id
              : undefined

          return {
            material_id: item.material?.id,
            material_name: item.material?.name,
            available_stock: itemStock.total_available_qty,
            on_hand_stock: itemStock.total_qty,
            min: itemStock.min,
            max: itemStock.max,
            managed_in_batch,
            change_qty: undefined,
            transaction_reason: null,
            other_reason: null,
            other_reason_required: false,
            transaction_type_id: transactionType?.value,
            is_openvial: item.material?.is_open_vial,
            temperature_sensitive: item.material?.is_temperature_sensitive,
            pieces_per_unit:
              item.material?.consumption_unit_per_distribution_unit,
            stock_id: stockId,
            unit: item.material?.unit_of_consumption,
            batches: setIntialBatch({
              obj: itemStock,
              materialItemList,
              selectedItem: item,
            }),
          }
        })

      if (!inComingStock.length) return addEmptyStock({ item })

      setValue('items', [...(items || []), ...inComingStock])
    } catch (error) {
      if (error instanceof AxiosError) {
        const { message } = error.response?.data as { message: string }

        toast.danger({ description: message })
      }
    } finally {
      setLoadingPopup(false)
    }
  }

  const handleDeleteItemAddStock = (index: number) => {
    const copyItems = [...items] as CreateTransactionAddStock['items']
    if (index > -1) {
      // only splice array when item is found
      copyItems.splice(index, 1) // 2nd parameter means remove one item only
      setValue('items', copyItems)
    }
  }

  const handleRemoveMaterialAddStock = ({ item }: { item: Stock }) => {
    const index = (items as CreateTransactionAddStock['items'])?.findIndex(
      (i) => i.material_id === item.material?.id
    )
    if (index > -1) handleDeleteItemAddStock(index)
    return false
  }

  return {
    handleAddItemAddStock,
    handleDeleteItemAddStock,
    items,
    handleRemoveMaterialAddStock,
    errors,
  }
}
