import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { Stock } from '#types/stock'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useFormContext } from 'react-hook-form'

import { listStockDetailStock } from '../../transaction-create.service'
import { createTransactionRemoveStock } from '../transaction-remove-stock.service'
import {
  CreateTransactionRemoveSubmit,
  TDetailMaterials,
} from '../transaction-remove-stock.type'
import { ApiErrorResponse } from '../../transaction-create.type'
import { extractErrorMessage } from '../../utils/helper'

export const useTransactionCreateRemoveStock = (
  t: TFunction<['transactionCreate', 'common']>
) => {
  const methods = useFormContext()
  const [isLoadingMaterialStock, setIsLoadingMaterialStock] = useState(false)
  const selectedEntityId = methods?.getValues('entity')?.value
  const selectedActivity = methods?.watch('activity') || null
  const getValueMaterials =
    (methods?.getValues('items') as TDetailMaterials[]) || []
  const router = useSmileRouter()

  const { mutate: mutateRemove, isPending: isPendingRemove } = useMutation({
    mutationKey: ['transactionRemoveStock', methods?.getValues()],
    mutationFn: createTransactionRemoveStock,
    onSuccess: () => {
      toast.success({
        description: t(
          'transactionCreate:transaction_remove_stock.input_table.column.toast.success.create'
        ),
      })
      router.push(`/v5/transaction`)
    },
    onError: (error: AxiosError) => {
      const res = error.response?.data as ApiErrorResponse;
      const message = extractErrorMessage(res);
      toast.danger({ description: message });
      const errors:any = res.errors
      for (const item of Object.keys(errors)) {
        methods?.setError(item as keyof CreateTransactionRemoveSubmit, {
          message: errors?.[item][0],
        })
      }
    },
  })

  const handleDeleteMaterial = (index: number) => {
    methods.setValue(
      'items',
      getValueMaterials.filter((_: TDetailMaterials, i: number) => i !== index)
    )
    methods.setValue('material', null)
  }

  const handleAddItemRemoveStock = async (value: { item: Stock }) => {
    methods.setValue('material', value?.item?.material)
    setIsLoadingMaterialStock(true)
    try {
      const materialStockData = await listStockDetailStock({
        entity_id: selectedEntityId,
        material_id: value?.item?.material?.id,
        group_by: 'activity',
      })

      if (materialStockData?.data) {
        const selectedMaterialStockData = materialStockData?.data
          ?.filter(
            (item) =>
              Number(item?.activity?.id) === Number(selectedActivity?.value)
          )
          ?.map((item) => ({
            ...item,
            transaction_reason: null,
            other_reason: null,
            input_qty: null,
            material_status: null,
            material_id: value?.item?.material?.id,
            material: value?.item?.material,
            stocks: item?.stocks?.map((stock) => ({
              ...stock,
              is_temperature_sensitive:
                value?.item?.material?.is_temperature_sensitive,
              consumption_unit_per_distribution_unit:
                value?.item?.material?.consumption_unit_per_distribution_unit,
            })),
          }))
        if (getValueMaterials?.length <= 0) {
          methods.setValue('items', selectedMaterialStockData)
        } else {
          const newTempData = [
            ...getValueMaterials,
            ...selectedMaterialStockData,
          ]
          methods.setValue('items', newTempData)
        }
      }
    } catch (error) {
      toast.danger({
        description:
          (error as AxiosError)?.message ?? t('common:message.common.error'),
      })
    } finally {
      setIsLoadingMaterialStock(false)
    }
  }

  const handleDeleteItemRemoveStock = (value: { item: Stock }) => {
    methods.setValue('material', null)
    methods.setValue(
      'items',
      getValueMaterials.filter(
        (item) => item?.material?.id !== value?.item?.material?.id
      )
    )
  }

  useSetLoadingPopupStore(isLoadingMaterialStock || isPendingRemove)

  return {
    handleDeleteMaterial,
    handleAddItemRemoveStock,
    mutateRemove,
    handleDeleteItemRemoveStock,
  }
}
