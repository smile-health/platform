import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { AxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useFormContext } from 'react-hook-form'

import { createTransactionReturnFromFacility } from '../transaction-return-from-facility.service'
import {
  CreateTransactionReturnFromFacilitySubmit,
  TTransactionReturnFacilityConsumptionData,
} from '../transaction-return-from-facility.type'
import { getFirstErrorMessage } from '../transaction-return-from-facility.utils'

export const useTransactionCreateReturnFromFacility = (
  t: TFunction<['transactionCreate', 'common']>
) => {
  const methods = useFormContext()
  const items = methods?.watch('items') ?? []
  const getValueMaterials = items
  const customerIsOpenVial = methods?.watch('is_open_vial_customer') ?? false
  const router = useSmileRouter()

  const {
    mutate: mutateReturnFromFacility,
    isPending: isPendingReturnFromFacility,
  } = useMutation({
    mutationKey: ['transactionReturnFromFacility', methods?.getValues()],
    mutationFn: createTransactionReturnFromFacility,
    onSuccess: () => {
      toast.success({
        description: t(
          'transactionCreate:transaction_return_from_facility.input_table.column.toast.success.create'
        ),
      })
      router.push(`/v5/transaction`)
    },
    onError: (error: AxiosError) => {
      const { message, errors } = error.response?.data as {
        message: string
        errors: any
      }
      const messageInErrors = getFirstErrorMessage(errors)

      toast.danger({ description: messageInErrors ?? message })
      for (const item of Object.keys(errors)) {
        methods?.setError(
          item as keyof CreateTransactionReturnFromFacilitySubmit,
          {
            message: errors?.[item][0],
          }
        )
      }
    },
  })

  const handleDeleteTransaction = (index: number) => {
    const newData = [...getValueMaterials]
    newData.splice(index, 1)
    methods.setValue('items', newData)
    methods.clearErrors(`items.${index}`)
  }

  const handleAdd = async (data: TTransactionReturnFacilityConsumptionData) => {
    if (!data) return
    const isProtocolTransaction = !!data.protocol?.id

    if (isProtocolTransaction)
      methods.setValue('items', [
        ...items,
        {
          ...data,
          return_qty: data?.max_return,
          customer_is_open_vial: customerIsOpenVial,
          material: {
            ...data?.material,
            consumption_unit_per_distribution_unit: data?.max_return,
          },
        },
      ])
    else methods.setValue('items', [...items, { customer_is_open_vial: customerIsOpenVial, ...data }])
  }

  const handleRemove = (data: TTransactionReturnFacilityConsumptionData) => {
    methods.setValue(
      'items',
      getValueMaterials.filter(
        (item: TTransactionReturnFacilityConsumptionData) =>
          Number(item?.id) !== Number(data?.id)
      )
    )
    methods.clearErrors(`items`)
  }

  const handleSelectConsumptionTransaction = (
    data: TTransactionReturnFacilityConsumptionData
  ) => {
    const isRemove =
      items?.some(
        (x: TTransactionReturnFacilityConsumptionData) =>
          Number(x.id) === Number(data.id)
      ) ?? false

    if (!isRemove) handleAdd(data)
    else handleRemove(data)
  }

  useSetLoadingPopupStore(isPendingReturnFromFacility)

  return {
    handleDeleteTransaction,
    handleSelectConsumptionTransaction,
    mutateReturnFromFacility,
    items,
  }
}
