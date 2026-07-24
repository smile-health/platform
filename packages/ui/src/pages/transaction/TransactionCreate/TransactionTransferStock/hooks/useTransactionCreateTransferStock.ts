import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { DetailStock, Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { useFormContext } from 'react-hook-form'

import { listStockDetailStock } from '../../transaction-create.service'
import {
  CreateTransactionBatch,
  CreateTransactionTransferStock,
  setBatches,
} from '../transaction-transfer-stock.type'

export default function useTransactionCreateTransferStock() {
  const { watch, setValue } = useFormContext<CreateTransactionTransferStock>()
  const { items, entity, transactionType } = watch()
  const { setLoadingPopup } = useLoadingPopupStore()

  const setIntialBatch = ({ materialItemList, selectedItem }: setBatches) => {
    if (materialItemList && materialItemList.length > 0) {
      return materialItemList.map((itm) => {
        const batchTemp: CreateTransactionBatch = {
          batch_id: itm.id ?? null,
          activity_id: itm?.activity.id ?? null,
          activity_name: itm?.activity.name ?? null,
          change_qty: null,
          code: itm?.batch?.code ?? null,
          production_date: itm?.batch?.production_date ?? null,
          expired_date: itm?.batch?.expired_date ?? null,
          manufacturer: itm.batch?.manufacture?.id
            ? {
                value: itm?.batch?.manufacture.id,
                label: itm?.batch?.manufacture?.name ?? '',
              }
            : null,
          available_qty: itm?.available_qty ?? 0,
          pieces_per_unit:
            selectedItem?.material?.consumption_unit_per_distribution_unit ??
            null,
          managed_in_batch: selectedItem?.material?.is_managed_in_batch ?? null,
          budget_source_year: itm.year,
          budget_source: {
            label: itm.budget_source?.name ?? '',
            value: itm.budget_source?.id,
          },
          budget_source_total_price: itm.total_price,
          budget_source_price: itm.price,
        }

        return batchTemp
      })
    }
    return []
  }

  const handleAddItemTransferStock = async ({ item }: { item: Stock }) => {
    setLoadingPopup(true)
    try {
      if (items?.some(({ material_id }) => material_id === item.material?.id))
        return

      const { data } = await listStockDetailStock({
        group_by: 'activity',
        entity_id: entity?.value,
        material_id: item.material?.id,
        only_have_qty: 1,
      })
      if (data?.length === 0) return
      const [currentActivity] = data.reduce<[DetailStock[]]>(
        ([current], stock) => {
          current.push(stock)

          return [current]
        },
        [[]]
      )
      const managed_in_batch = item.material?.is_managed_in_batch

      const currentItems = [...(items || [])]
      const inComingBatches = currentActivity.map((stock) =>
        setIntialBatch({
          materialItemList: stock?.stocks,
          selectedItem: item,
        })
      )
      const inComingStock = {
        material_id: item.material?.id,
        material_name: item.material?.name,
        available_stock: item?.total_available_qty ?? 0,
        managed_in_batch,
        transaction_type_id: transactionType?.value,
        pieces_per_unit: item.material?.consumption_unit_per_distribution_unit,
        unit: item.material?.unit_of_consumption,
        is_vaccine: item?.protocol?.is_patient_needed,
        is_need_sequence: item?.protocol?.is_sequence,
        destination_activity: null,
        batches: inComingBatches?.flat(),
      }
      currentItems.push(inComingStock)
      setValue('items', currentItems)
    } catch (error) {
      if (error instanceof AxiosError) {
        const { message } = error.response?.data as { message: string }

        toast.danger({ description: message })
      }
    } finally {
      setLoadingPopup(false)
    }
  }

  const handleDeleteItemTransferStock = (index: number) => {
    const copyItems = [...items]
    if (index > -1) {
      // only splice array when item is found
      copyItems.splice(index, 1) // 2nd parameter means remove one item only
      setValue('items', copyItems)
    }
  }

  const handleRemoveMaterialTransferStock = ({ item }: { item: Stock }) => {
    const index = items?.findIndex((i) => i.material_id === item.material?.id)
    if (index > -1) handleDeleteItemTransferStock(index)
    return false
  }

  const checkIsHaveQty = (
    item: CreateTransactionBatch[] | null | undefined
  ) => {
    const checkQty = item?.find((i) => !!i.change_qty)
    return !!checkQty
  }
  
  return {
    handleAddItemTransferStock,
    handleDeleteItemTransferStock,
    handleRemoveMaterialTransferStock,
    checkIsHaveQty,
  }
}
