import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MaterialCompanions } from '../../order.type'
import { handleBodyRequest } from '../order-create-central-distribution.helper'
import {
  createOrderCentralDistribution,
  CreateOrderCentralDistributionBody,
} from '../order-create-central-distribution.service'
import {
  TOrderFormItemStocksValues,
  TOrderFormItemsValues,
  TOrderFormValues,
} from '../order-create-central-distribution.type'
import orderCreateCentralDistributionSchema from '../schemas/orderCreateCentralDistributionSchema'

type Params = {
  onShowConfirmation: VoidFunction
  onShowModalCompanion: (show: boolean) => void
}

export default function useOrderCreateCentralDistribution({
  onShowConfirmation,
  onShowModalCompanion,
}: Params) {
  const user = getUserStorage()
  const userProgram = getProgramStorage()
  const router = useSmileRouter()

  const { t: tCommon } = useTranslation()
  const { t } = useTranslation('orderCentralDistribution')

  const methods = useForm<TOrderFormValues>({
    resolver: yupResolver(orderCreateCentralDistributionSchema(t)),
    mode: 'onChange',
    defaultValues: {
      vendor: {
        label: user?.entity?.name,
        value: userProgram?.entity_id,
      },
      required_date: null,
      order_items: [],
    },
  })

  const activity = methods.watch('activity')
  const order_items = methods.watch('order_items')

  const hasCompanions = (order_items: TOrderFormItemsValues[]) => {
    const existingMaterialIds = new Set(order_items.map((item) => item.id))

    const mappedMaterials = order_items
      .flatMap((item) => item.companions ?? [])
      .filter((companion) => !existingMaterialIds.has(companion.id))

    const uniqueMap = new Map(mappedMaterials.map((item) => [item?.id, item]))
    return Array.from(uniqueMap.values())
  }

  const companionList = hasCompanions(order_items)

  const { append, remove } = useFieldArray({
    control: methods.control,
    name: 'order_items',
  })

  const onCheckIsValid = async () => {
    const isValid = await methods.trigger()
    const errors = methods.formState.errors

    if (isValid) {
      if (companionList?.length) {
        onShowModalCompanion(true)
      } else {
        onShowConfirmation()
      }
    } else if (errors?.order_items?.length) {
      for (let i = 0; i < errors.order_items.length; i++) {
        const item = errors.order_items[i]
        if (item?.stocks?.length) {
          methods.setError(`order_items.${i}.stocks`, {
            type: 'required',
            message: t('form.ordered_qty.validation.required'),
          })
        }
      }
    }
  }

  const onSubmit: SubmitHandler<TOrderFormValues> = (formData) => {
    const body = handleBodyRequest(formData, activity?.value)

    mutations.mutate(body)
  }

  const onSetOrderItems = async (
    index: number,
    stocks: TOrderFormItemStocksValues[]
  ) => {
    methods.setValue(`order_items.${index}.stocks`, stocks, {
      shouldValidate: true,
    })
  }

  const mutations = useMutation({
    mutationFn: (data: CreateOrderCentralDistributionBody) =>
      createOrderCentralDistribution(data),
    onSuccess: (data) => {
      toast.success({
        description: tCommon('message.success.create', {
          type: t('info.message.new_distribution')?.toLowerCase(),
        }),
      })
      router.push(`/v5/order/${data?.id}`)
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        toast.danger({ description: response.message })
      }
    },
  })

  useSetLoadingPopupStore(mutations.isPending)

  return {
    methods,
    append,
    remove,
    onSubmit,
    companionList,
    onCheckIsValid,
    onSetOrderItems,
    isPendingMutateOrder: mutations.isPending,
  }
}
