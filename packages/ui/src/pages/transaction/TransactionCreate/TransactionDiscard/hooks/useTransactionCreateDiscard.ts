import { toast } from '#components/toast'
import { listStockDetailStock } from '#services/stock'
import { useLoadingPopupStore } from '#store/loading.store'
import { Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { useFormContext } from 'react-hook-form'

import { TRANSACTION_TYPE } from '../../transaction-create.constant'
import {
  CreateTransactionDiscard,
  DiscardItem,
  ItemsTransactionDiscard,
} from '../transaction-discard.type'

export const useTransactionCreateDiscard = () => {
  const { setLoadingPopup } = useLoadingPopupStore()
  const { watch, setValue, getValues, clearErrors } =
    useFormContext<CreateTransactionDiscard>()
  const { entity, activity } = watch()

  const handleAddItemDiscard = async (stock: Stock) => {
    setLoadingPopup(true)

    try {
      const params = {
        group_by: 'activity' as const,
        entity_id: entity?.value,
        material_id: stock.material?.id,
        only_have_qty: 1,
      }

      const { data } = await listStockDetailStock(params)
      const currActivity =
        activity && 'value' in activity ? activity.value : undefined

      let newDetails: DiscardItem[] = []
      const newData = data
        .filter((x) => x.activity?.id === currActivity)
        .map((x) => {
          newDetails = x.stocks
            .filter((y) => y.activity.id === currActivity)
            .map((z) => ({
              transaction_type_id: TRANSACTION_TYPE.DISCARD,
              other_reason: null,
              material_id: stock.material?.id ?? 0,
              stock_id: z.id,
              available_qty: z.available_qty,
              is_temperature_sensitive:
                x.material?.is_temperature_sensitive ??
                stock.material?.is_temperature_sensitive ??
                0,
              stock_quality_id: null,
              qty: undefined,
              consumption_unit_per_distribution_unit:
                stock.material?.consumption_unit_per_distribution_unit ?? 1,
              stock_quality: null,
              transaction_reason: null,
              is_open_vial: stock.material?.is_open_vial ?? 0,
              on_hand: z.qty,
              open_vial_qty: z.open_vial_qty,
              ...z.open_vial_qty === 0 && {
                open_vial: 0,
              }
            }))

          return {
            ...x,
            material_id: x.material?.id ?? stock.material?.id,
            material: x.material || stock.material,
          }
        })

      const { items = [] } = getValues()
      const newItems = [...items, ...newData] as ItemsTransactionDiscard
      setValue('items', newItems)
      if (newData.length > 0) setValue(`items.${newItems.length - 1}.details`, newDetails)
    } catch (error) {
      if (error instanceof AxiosError) {
        const { message } = error.response?.data as { message: string }

        toast.danger({ description: message })
      }
    } finally {
      setLoadingPopup(false)
    }
  }

  const handleRemoveItemDiscard = (item: Stock) => {
    const newItems = [...watch('items')].filter(
      (x) => x.material_id !== item.material?.id
    )

    setValue('items', newItems as ItemsTransactionDiscard)
    clearErrors('items')
  }

  return {
    handleAddItemDiscard,
    handleRemoveItemDiscard,
  }
}
